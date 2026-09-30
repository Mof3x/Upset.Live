const configuredUrl = (import.meta.env.VITE_DIRECTUS_URL || "").replace(/\/$/, "");

// In development, requests go through the Vite proxy (/cms -> VITE_DIRECTUS_URL,
// see vite.config.js) so they work without Directus CORS. Set
// VITE_DIRECTUS_DEV_PROXY=false to call Directus directly in development.
const useDevProxy =
  import.meta.env.DEV && Boolean(configuredUrl) && import.meta.env.VITE_DIRECTUS_DEV_PROXY !== "false";
const directusUrl = useDevProxy ? `${window.location.origin}/cms` : configuredUrl;

export class DirectusRequestError extends Error {
  constructor(message, { status, code, url, details } = {}) {
    super(message);
    this.name = "DirectusRequestError";
    this.status = status;
    this.code = code;
    this.url = url;
    this.details = details;
  }
}

export function getDirectusUrl() {
  return directusUrl;
}

// A 403 means the Public role cannot read this collection or field yet.
// Pages show a "not open yet" state for it instead of a generic error.
export function isForbiddenError(error) {
  return (
    error instanceof DirectusRequestError &&
    (error.status === 403 || error.code === "FORBIDDEN")
  );
}

// Directus rejects the whole request when one requested field is not readable
// (or does not exist). This matches that case, not collection-level refusals.
function isFieldPermissionError(error) {
  return (
    isForbiddenError(error) &&
    /permission to access fields?\s/i.test(error.message || "")
  );
}

function buildUrl(path, params = {}) {
  if (!directusUrl) {
    throw new DirectusRequestError(
      "VITE_DIRECTUS_URL is not configured."
    );
  }

  const url = new URL(`${directusUrl}/${path.replace(/^\//, "")}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, item));
      return;
    }

    url.searchParams.set(key, value);
  });

  return url;
}

async function fetchJson(path, { params, signal, headers = {}, ...options } = {}) {
  const url = buildUrl(path, params);
  let response;
  let payload;

  try {
    response = await fetch(url, {
      ...options,
      signal,
      headers: {
        Accept: "application/json",
        ...headers,
      },
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new DirectusRequestError("Unable to reach the Directus API.", {
      url: url.toString(),
      details: error,
    });
  }

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const apiError = payload?.errors?.[0];
    throw new DirectusRequestError(
      apiError?.message || `Directus request failed with status ${response.status}.`,
      {
        status: response.status,
        code: apiError?.extensions?.code,
        url: url.toString(),
        details: payload,
      }
    );
  }

  return payload?.data ?? payload;
}

// GET requests that ask for specific fields fall back once to `fields=*`
// (without sorting) when Directus refuses a field. `*` returns only what the
// Public role may read, so pages keep rendering the basics while permissions
// are being configured. Filters are never dropped, so unpublished records
// stay hidden.
export async function directusRequest(path, options = {}) {
  try {
    return await fetchJson(path, options);
  } catch (error) {
    const method = (options.method || "GET").toUpperCase();
    const params = options.params || {};

    if (method !== "GET" || !params.fields || params.fields === "*" || !isFieldPermissionError(error)) {
      throw error;
    }

    if (import.meta.env.DEV) {
      console.warn(
        `[directus] ${path}: ${error.message} Retrying with fields=* until the Public role can read the requested fields.`
      );
    }

    // eslint-disable-next-line no-unused-vars
    const { sort, ...rest } = params;
    return fetchJson(path, { ...options, params: { ...rest, fields: "*" } });
  }
}

export async function getCollection(collection, options = {}) {
  return directusRequest(`/items/${collection}`, options);
}

export async function getItem(collection, identifier, options = {}) {
  return directusRequest(
    `/items/${collection}/${encodeURIComponent(identifier)}`,
    options
  );
}

export async function getItemBySlug(collection, slug, options = {}) {
  const records = await getCollection(collection, {
    ...options,
    params: {
      ...options.params,
      "filter[slug][_eq]": slug,
      limit: 1,
    },
  });

  return records?.[0] || null;
}

export async function getSingleton(collection, options = {}) {
  const result = await directusRequest(`/items/${collection}`, options);
  // site_settings is not configured as a singleton, so it arrives as a list.
  return Array.isArray(result) ? result[0] || null : result;
}

const directusUrl = (import.meta.env.VITE_DIRECTUS_URL || "").replace(/\/$/, "");

export class DirectusRequestError extends Error {
  constructor(message, { status, url, details } = {}) {
    super(message);
    this.name = "DirectusRequestError";
    this.status = status;
    this.url = url;
    this.details = details;
  }
}

export function getDirectusUrl() {
  return directusUrl;
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

export async function directusRequest(
  path,
  { params, signal, headers = {}, ...options } = {}
) {
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
    const apiMessage = payload?.errors?.[0]?.message;
    throw new DirectusRequestError(
      apiMessage || `Directus request failed with status ${response.status}.`,
      {
        status: response.status,
        url: url.toString(),
        details: payload,
      }
    );
  }

  return payload?.data ?? payload;
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
  return directusRequest(`/items/${collection}`, options);
}

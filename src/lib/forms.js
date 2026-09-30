// Public forms never write to Directus from the browser. When
// VITE_FORMS_ENDPOINT points at a server-side endpoint (e.g. a Cloudflare
// Worker that validates, rate-limits and stores the submission with its own
// credential), submissions are POSTed there. Until then the form hands the
// visitor a pre-filled email to send from their own mail client.

const endpoint = (import.meta.env.VITE_FORMS_ENDPOINT || "").replace(/\/$/, "");
export const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || "hello@upset.live";

export const hasFormsEndpoint = Boolean(endpoint);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEnquiry(values, requiredFields) {
  const errors = {};
  requiredFields.forEach((field) => {
    if (!String(values[field] || "").trim()) errors[field] = "This field is required.";
  });
  if (values.email && !EMAIL_PATTERN.test(String(values.email).trim())) {
    errors.email = "Enter a valid email address.";
  }
  return errors;
}

function mailtoHref(subject, lines) {
  const body = lines.filter(Boolean).join("\n");
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Returns { mode: "sent" } after a successful POST, or
// { mode: "mailto", href } when no endpoint is configured.
export async function submitForm(kind, values, { subject, summaryLines = [] } = {}) {
  // Honeypot: real visitors never see or fill this field.
  if (values.company) return { mode: "sent" };

  if (!endpoint) {
    return { mode: "mailto", href: mailtoHref(subject || `UpsetXociety: ${kind}`, summaryLines) };
  }

  const response = await fetch(`${endpoint}/${encodeURIComponent(kind)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ ...values, company: undefined }),
  });

  if (!response.ok) {
    throw new Error(`The enquiry could not be sent (status ${response.status}).`);
  }

  return { mode: "sent" };
}

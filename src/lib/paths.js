// Link to a record by slug. The slug is URL-encoded so slugs entered with spaces,
// a trailing space or other reserved characters still round-trip: browsers strip
// trailing whitespace from raw hrefs, and React Router decodes the param again.
export function recordPath(base, slug) {
  return `${base}/${encodeURIComponent(slug ?? "")}`;
}

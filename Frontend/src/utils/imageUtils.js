/**
 * Image Utility Functions
 * Helper functions for resolving and handling image URLs
 */

/**
 * Resolve image URL to absolute path or placeholder
 * @param {string|null} raw - Raw image path/URL
 * @returns {string} Resolved absolute URL or placeholder SVG
 */
export const resolveImage = (raw) => {
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:3802";
  const placeholder = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%' height='100%' fill='%23f3f4f6' /><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='18'>No Image</text></svg>`,
  )}`;

  if (!raw) return placeholder;
  if (typeof raw !== "string") return placeholder;

  // Filter out placeholder.com URLs
  if (raw.includes("placeholder.com")) return placeholder;

  // Already absolute
  if (/^https?:\/\//i.test(raw) || /^\/\//.test(raw)) return encodeURI(raw);

  // Leading slash -> API host + path
  if (raw.startsWith("/")) return encodeURI(`${base}${raw}`);

  // Otherwise treat as relative path on API
  return encodeURI(`${base}/${raw}`);
};

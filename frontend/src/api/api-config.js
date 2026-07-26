export function resolveApiBaseUrl(configuredUrl, isDevelopment) {
  const normalizedUrl = configuredUrl?.trim().replace(/\/+$/, "");

  if (normalizedUrl) {
    return normalizedUrl;
  }

  if (isDevelopment) {
    return "/api/v1";
  }

  throw new Error(
    "VITE_API_BASE_URL must be configured for production authentication",
  );
}

export function resolveApiBaseUrl(configuredUrl, isDevelopment) {
  const normalizedUrl = configuredUrl?.trim().replace(/\/+$/, "");

  if (normalizedUrl) {
    if (typeof window !== "undefined") {
      try {
        const configured = new URL(normalizedUrl, window.location.origin);
        const isLocalApi = ["localhost", "127.0.0.1", "::1"].includes(
          configured.hostname,
        );
        const isRemoteClient = !["localhost", "127.0.0.1", "::1"].includes(
          window.location.hostname,
        );
        if (isLocalApi && isRemoteClient) return "/api/v1";
      } catch {
        // Keep the configured value for the normal validation/error path.
      }
    }
    return normalizedUrl;
  }

  if (isDevelopment) {
    return "/api/v1";
  }

  throw new Error(
    "VITE_API_BASE_URL must be configured for production authentication",
  );
}

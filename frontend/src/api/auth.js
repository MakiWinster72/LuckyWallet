import { resolveApiBaseUrl } from "./api-config";

const API_BASE_URL = resolveApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL,
  import.meta.env.DEV,
);

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function parseError(response) {
  let body;

  try {
    body = await response.json();
  } catch {
    // Some server or network errors do not include a JSON body.
  }

  return new ApiError(
    response.status,
    body?.detail?.code ?? "REQUEST_FAILED",
    body?.detail?.message ?? "请求失败，请稍候重试",
  );
}

export function getAccessToken() {
  return sessionStorage.getItem("luckywallet_access_token");
}

export async function authenticatedApiRequest(path, options = {}) {
  const token = getAccessToken();
  if (!token) {
    throw new ApiError(401, "UNAUTHORIZED", "登录状态已失效，请重新登录");
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });
  if (!response.ok) throw await parseError(response);
  return response;
}

export function resolveAssetUrl(path) {
  if (!path || /^https?:\/\//.test(path)) return path;
  return `${new URL(API_BASE_URL, window.location.origin).origin}${path}`;
}

export async function uploadAvatarApi(file) {
  const form = new FormData();
  form.append("avatar", file);
  const response = await authenticatedApiRequest("/auth/me/avatar", {
    method: "POST",
    body: form,
  });
  return response.json();
}

export async function loginApi(data) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return response.json();
}

export async function getMeApi(token) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return response.json();
}

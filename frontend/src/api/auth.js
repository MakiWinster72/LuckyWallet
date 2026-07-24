const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

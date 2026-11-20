const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
const REQUEST_TIMEOUT_MS = 15_000;

export interface ApiResponse {
  message?: string;
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function post<T extends ApiResponse>(
  endpoint: string,
  body: Record<string, string>,
): Promise<T> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new Error(
      "Unable to reach the server. Please check your internet connection and try again.",
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let message = data?.message;
    if (Array.isArray(message)) message = message.join(", ");

    throw new ApiError(
      typeof message === "string"
        ? message
        : "Something went wrong. Please try again.",
      response.status,
      typeof data?.code === "string" ? data.code : undefined,
    );
  }

  return data as T;
}

export function verifyEmail(token: string): Promise<ApiResponse> {
  return post<ApiResponse>("/auth/verify-email", { token });
}

export function revokeEmailVerification(token: string): Promise<ApiResponse> {
  return post<ApiResponse>("/auth/revoke-email-verification", { token });
}

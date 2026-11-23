const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  user?: T;
  token?: string;
  listing?: T;
  listings?: T[];
  pagination?: {
    totalItems: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class ApiServiceError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiServiceError";
    this.status = status;
    this.data = data;
  }
}

class HttpClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("nestrivo_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: this.getHeaders(),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ApiServiceError(data.message || `Lỗi yêu cầu HTTP ${res.status}`, res.status, data);
    }
    return data;
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ApiServiceError(data.message || `Lỗi yêu cầu HTTP ${res.status}`, res.status, data);
    }
    return data;
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ApiServiceError(data.message || `Lỗi yêu cầu HTTP ${res.status}`, res.status, data);
    }
    return data;
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ApiServiceError(data.message || `Lỗi yêu cầu HTTP ${res.status}`, res.status, data);
    }
    return data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ApiServiceError(data.message || `Lỗi yêu cầu HTTP ${res.status}`, res.status, data);
    }
    return data;
  }
}

export const httpClient = new HttpClient();
export const api = httpClient;
export default httpClient;
export { API_BASE_URL };


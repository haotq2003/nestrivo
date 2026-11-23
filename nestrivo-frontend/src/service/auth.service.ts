import { 
  AuthUser, 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse 
} from "@/types/auth";
import { API_BASE_URL, ApiServiceError } from "./api";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";

export const AUTH_TOKEN_KEY = "nestrivo_token";
export const AUTH_USER_KEY = "nestrivo_user";

// Storage Helpers
export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredAuth(user: AuthUser, token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    window.dispatchEvent(new Event("nestrivo_auth_change"));
  } catch {
    // Storage quota error handling
  }
}

export function removeStoredAuth(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    window.dispatchEvent(new Event("nestrivo_auth_change"));
  } catch {
    // Ignore error
  }
}

function isNetworkException(err: Error): boolean {
  return (
    err.name === "TypeError" ||
    err.message.includes("fetch") ||
    err.message.includes("Network") ||
    err.message.includes("Failed to fetch") ||
    err.message.includes("Load failed")
  );
}

/**
 * Service gọi API Đăng nhập
 * POST /api/auth/login
 */
export async function loginApi(credentials: LoginCredentials): Promise<AuthResponse> {
  const normalizedEmail = credentials.email.trim().toLowerCase();

  // 1. Gọi trực tiếp API backend thật
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        password: credentials.password,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ApiServiceError(
        data.message || `Đăng nhập thất bại (HTTP ${res.status}).`,
        res.status,
        data
      );
    }

    if (data.token && data.user) {
      setStoredAuth(data.user, data.token);
      return data;
    }
  } catch (err: unknown) {
    if (err instanceof Error && !isNetworkException(err)) {
      // Ném ra thông báo lỗi nghiệp vụ thực tế từ backend (400, 401, 403, 500)
      throw err;
    }
    // Backend offline / network không kết nối được -> Fallback sang tài khoản Demo
  }

  // 2. Fallback khi Backend offline (Tài khoản mẫu)
  const matchedDemo = DEMO_ACCOUNTS.find(
    (acc) => acc.email.toLowerCase() === normalizedEmail
  );

  if (matchedDemo) {
    if (credentials.password === matchedDemo.password) {
      const mockToken = `mock-token-${matchedDemo.user.id}-${Date.now()}`;
      setStoredAuth(matchedDemo.user, mockToken);
      return {
        message: "Đăng nhập thành công (Tài khoản mẫu).",
        user: matchedDemo.user,
        token: mockToken,
      };
    } else {
      throw new Error("Mật khẩu không chính xác. Mật khẩu mẫu là: " + matchedDemo.password);
    }
  }

  // Fallback cho tài khoản tự đăng ký lưu tạm local
  const existingStored = getStoredUser();
  if (existingStored && existingStored.email.toLowerCase() === normalizedEmail) {
    const mockToken = `mock-token-${existingStored.id}-${Date.now()}`;
    setStoredAuth(existingStored, mockToken);
    return {
      message: "Đăng nhập thành công.",
      user: existingStored,
      token: mockToken,
    };
  }

  throw new Error("Email hoặc mật khẩu không chính xác.");
}

/**
 * Service gọi API Đăng ký
 * POST /api/auth/register
 */
export async function registerApi(credentials: RegisterCredentials): Promise<AuthResponse> {
  const normalizedEmail = credentials.email.trim().toLowerCase();

  // 1. Gọi trực tiếp API backend thật
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        password: credentials.password,
        fullName: credentials.fullName.trim(),
        phoneNumber: credentials.phoneNumber?.trim() || null,
        isLandlord: credentials.isLandlord ?? false,
        landlordDisplayName: credentials.landlordDisplayName?.trim() || credentials.fullName.trim(),
        landlordDescription: credentials.landlordDescription?.trim() || null,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ApiServiceError(
        data.message || `Thông tin đăng ký không hợp lệ (HTTP ${res.status}).`,
        res.status,
        data
      );
    }

    if (data.token && data.user) {
      setStoredAuth(data.user, data.token);
      return data;
    }
  } catch (err: unknown) {
    if (err instanceof Error && !isNetworkException(err)) {
      // Ném ra thông báo lỗi từ backend (ví dụ: Email đã được sử dụng, mật khẩu ngắn...)
      throw err;
    }
    // Backend offline -> Cho phép đăng ký demo
  }

  // 2. Demo fallback registration khi backend offline
  const roles = credentials.isLandlord ? ["RENTER", "LANDLORD"] : ["RENTER"];
  const newUser: AuthUser = {
    id: `user-${Date.now()}`,
    email: normalizedEmail,
    fullName: credentials.fullName.trim(),
    phoneNumber: credentials.phoneNumber?.trim() || null,
    avatarUrl: null,
    roles,
    isActive: true,
    landlordProfile: credentials.isLandlord
      ? {
          displayName: credentials.landlordDisplayName?.trim() || credentials.fullName.trim(),
          description: credentials.landlordDescription?.trim() || null,
          verificationStatus: "PENDING",
        }
      : null,
  };

  const mockToken = `mock-token-${newUser.id}-${Date.now()}`;
  setStoredAuth(newUser, mockToken);

  return {
    message: credentials.isLandlord
      ? "Đăng ký tài khoản Chủ nhà thành công!"
      : "Đăng ký tài khoản thành công!",
    user: newUser,
    token: mockToken,
  };
}

/**
 * Service lấy thông tin người dùng hiện tại
 * GET /api/auth/me
 */
export async function fetchMeApi(): Promise<AuthUser | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.user) {
        setStoredAuth(data.user, token);
        return data.user;
      }
    } else if (res.status === 401 || res.status === 403) {
      removeStoredAuth();
      return null;
    }
  } catch {
    // Offline fallback
  }

  return getStoredUser();
}

export async function updateProfileApi(params: {
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string | null;
  isLandlord?: boolean;
  landlordDisplayName?: string;
  landlordDescription?: string;
}): Promise<AuthUser> {
  const token = getStoredToken();
  if (!token) throw new Error("Chưa đăng nhập");

  const res = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Cập nhật hồ sơ thất bại");
  }

  if (data.user) {
    const updatedToken = data.token || token;
    setStoredAuth(data.user, updatedToken);
    return data.user;
  }

  throw new Error("Dữ liệu trả về không hợp lệ");
}

/**
 * Auth Service đóng gói theo dạng OOP / Module
 */
export const authService = {
  login: loginApi,
  register: registerApi,
  getMe: fetchMeApi,
  updateProfile: updateProfileApi,
  logout: removeStoredAuth,
  getToken: getStoredToken,
  getUser: getStoredUser,
  setAuth: setStoredAuth,
};


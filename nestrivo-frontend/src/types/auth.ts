export type UserRole = "RENTER" | "LANDLORD" | "ADMIN";

export interface AuthLandlordProfile {
  id?: string;
  displayName?: string | null;
  description?: string | null;
  verificationStatus?: "PENDING" | "VERIFIED" | "REJECTED";
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  roles: string[];
  isActive?: boolean;
  landlordProfile?: AuthLandlordProfile | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  isLandlord?: boolean;
  landlordDisplayName?: string;
  landlordDescription?: string;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  token: string;
}


export type LandlordVerificationStatus = 
  | "NOT_VERIFIED" 
  | "PENDING" 
  | "APPROVED" 
  | "REJECTED";

export interface KycPersonalInfo {
  fullName: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  idNumber: string; // 12-digit Citizen ID (CCCD)
  issueDate: string;
  issuingAuthority: string;
  permanentAddress: string;
}

export interface KycDocuments {
  frontImage: string | null;
  frontFileName?: string | null;
  frontFileSize?: number | null;
  backImage: string | null;
  backFileName?: string | null;
  backFileSize?: number | null;
}

export interface KycVerificationData {
  status: LandlordVerificationStatus;
  personalInfo: KycPersonalInfo;
  documents: KycDocuments;
  submittedAt?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  rejectedFields?: string[];
  confirmedTerms: boolean;
}


import { KycVerificationData, KycPersonalInfo, KycDocuments } from "@/types/verification";

export const EMPTY_PERSONAL_INFO: KycPersonalInfo = {
  fullName: "",
  dateOfBirth: "",
  gender: "MALE",
  idNumber: "",
  issueDate: "",
  issuingAuthority: "Cục Cảnh sát Quản lý hành chính về trật tự xã hội",
  permanentAddress: "",
};

export const EMPTY_DOCUMENTS: KycDocuments = {
  frontImage: null,
  frontFileName: null,
  frontFileSize: null,
  backImage: null,
  backFileName: null,
  backFileSize: null,
};

export const DEFAULT_INITIAL_KYC: KycVerificationData = {
  status: "NOT_VERIFIED",
  personalInfo: EMPTY_PERSONAL_INFO,
  documents: EMPTY_DOCUMENTS,
  submittedAt: null,
  approvedAt: null,
  rejectedAt: null,
  rejectionReason: null,
  rejectedFields: [],
  confirmedTerms: false,
};

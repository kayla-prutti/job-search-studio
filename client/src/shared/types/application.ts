export type ApplicationStatus =
  | "Wishlist"
  | "Applied"
  | "Interviewing"
  | "Offer"
  | "Rejected";

export type Priority = "Low" | "Medium" | "High";
export type ValidationStatus = "valid" | "warning" | "error";

export type Application = {
  id: string;
  role: string;
  company: string;
  salary: number;
  status: ApplicationStatus;
  appliedDate: string | null;
  followUpDate: string | null;
  contact: string | null;
  notes: string | null;
  source: string;
  priority: Priority;
  jobUrl: string;
  validationStatus: ValidationStatus;
};

export type ExtractJobUrlResponse = {
  application: Omit<Application, "id">;
  extractionStatus: "extracted" | "fallback";
};

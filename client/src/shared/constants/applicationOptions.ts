import type { ApplicationStatus, Priority } from "../types/application";

export const statusOptions: ApplicationStatus[] = [
  "Wishlist",
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
];

export const priorityOptions: Priority[] = ["Low", "Medium", "High"];

export const sourceOptions = [
  "Company Website",
  "LinkedIn",
  "Greenhouse",
  "Lever",
  "Indeed",
  "Manual",
];

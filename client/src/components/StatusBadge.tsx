import type { ApplicationStatus } from "../types/application";

type StatusBadgeProps = {
  value: ApplicationStatus;
};

export function StatusBadge({ value }: StatusBadgeProps) {
  return <span className={`badge status-${value.toLowerCase()}`}>{value}</span>;
}

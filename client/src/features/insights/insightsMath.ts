import type { Application, ApplicationStatus } from "../../shared/types/application";

export type CategoryDatum = {
  label: string;
  value: number;
};

export type SourcePerformanceDatum = {
  source: string;
  total: number;
  interviewedOrBetter: number;
  rate: number;
};

export type WeeklyActivityDatum = {
  weekLabel: string;
  count: number;
};

const isActiveApplication = (application: Application) =>
  application.status !== "Offer" && application.status !== "Rejected";

const hasSalary = (application: Application) => application.salary > 0;

export const computeStatusCounts = (
  applications: Application[]
): Record<ApplicationStatus, number> => {
  const counts: Record<ApplicationStatus, number> = {
    Wishlist: 0,
    Applied: 0,
    Interviewing: 0,
    Offer: 0,
    Rejected: 0,
  };

  for (const application of applications) {
    counts[application.status] += 1;
  }

  return counts;
};

export const computeAverageSalaryByStatus = (
  applications: Application[]
): CategoryDatum[] => {
  const statuses: ApplicationStatus[] = [
    "Wishlist",
    "Applied",
    "Interviewing",
    "Offer",
    "Rejected",
  ];

  return statuses.map((status) => {
    const salaried = applications.filter(
      (application) => application.status === status && hasSalary(application)
    );
    const average = salaried.length
      ? salaried.reduce((sum, application) => sum + application.salary, 0) /
        salaried.length
      : 0;

    return { label: status, value: Math.round(average) };
  });
};

export const computeSourceCounts = (
  applications: Application[]
): CategoryDatum[] => {
  const counts = new Map<string, number>();

  for (const application of applications) {
    const source = application.source || "Unknown";
    counts.set(source, (counts.get(source) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
};

export const computeSourcePerformance = (
  applications: Application[]
): SourcePerformanceDatum[] => {
  const bySource = new Map<string, Application[]>();

  for (const application of applications) {
    const source = application.source || "Unknown";
    const existing = bySource.get(source) ?? [];
    existing.push(application);
    bySource.set(source, existing);
  }

  return Array.from(bySource.entries())
    .map(([source, apps]) => {
      const interviewedOrBetter = apps.filter(
        (application) =>
          application.status === "Interviewing" || application.status === "Offer"
      ).length;

      return {
        source,
        total: apps.length,
        interviewedOrBetter,
        rate: interviewedOrBetter / apps.length,
      };
    })
    .sort((a, b) => b.rate - a.rate || b.total - a.total);
};

export const computeConversionRates = (applications: Application[]) => {
  const counts = computeStatusCounts(applications);
  const totalApplied =
    counts.Applied + counts.Interviewing + counts.Offer + counts.Rejected;

  return {
    totalApplications: applications.length,
    totalApplied,
    interviewRate:
      totalApplied > 0 ? (counts.Interviewing + counts.Offer) / totalApplied : null,
    offerRate: totalApplied > 0 ? counts.Offer / totalApplied : null,
    rejectedCount: counts.Rejected,
  };
};

export const computeFollowUpHealth = (applications: Application[]) => {
  const activeApplications = applications.filter(isActiveApplication);
  const total = activeApplications.length;
  const withFollowUp = activeApplications.filter(
    (application) => !!application.followUpDate
  ).length;
  const withContact = activeApplications.filter(
    (application) => !!application.contact
  ).length;

  return {
    total,
    followUpRate: total > 0 ? withFollowUp / total : null,
    contactRate: total > 0 ? withContact / total : null,
  };
};

export const computeSalaryRange = (applications: Application[]) => {
  const salaries = applications
    .map((application) => application.salary)
    .filter((salary) => salary > 0)
    .sort((a, b) => a - b);

  if (salaries.length === 0) {
    return null;
  }

  const mid = Math.floor(salaries.length / 2);
  const median =
    salaries.length % 2 === 0
      ? Math.round((salaries[mid - 1] + salaries[mid]) / 2)
      : salaries[mid];

  return {
    min: salaries[0],
    max: salaries[salaries.length - 1],
    median,
  };
};

export const computeHighestSalaryOpportunities = (
  applications: Application[],
  limit = 5
): Application[] =>
  applications
    .filter(hasSalary)
    .sort((a, b) => b.salary - a.salary)
    .slice(0, limit);

const toWeekStart = (dateValue: string) => {
  const date = new Date(`${dateValue}T00:00:00`);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  return date;
};

const formatWeekLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const computeWeeklyActivity = (
  applications: Application[],
  maxWeeks = 16
): WeeklyActivityDatum[] => {
  const appliedDates = applications
    .map((application) => application.appliedDate)
    .filter((value): value is string => !!value);

  if (appliedDates.length === 0) {
    return [];
  }

  const weekStarts = appliedDates.map(toWeekStart);
  const earliest = new Date(Math.min(...weekStarts.map((date) => date.getTime())));
  const latest = new Date(Math.max(...weekStarts.map((date) => date.getTime())));

  const counts = new Map<string, number>();
  for (const date of weekStarts) {
    const key = date.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const weeks: WeeklyActivityDatum[] = [];
  const cursor = new Date(earliest);

  while (cursor.getTime() <= latest.getTime()) {
    const key = cursor.toISOString().slice(0, 10);
    weeks.push({
      weekLabel: formatWeekLabel(cursor),
      count: counts.get(key) ?? 0,
    });
    cursor.setDate(cursor.getDate() + 7);
  }

  return weeks.length > maxWeeks ? weeks.slice(-maxWeeks) : weeks;
};

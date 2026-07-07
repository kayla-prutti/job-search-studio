import { useMemo } from "react";
import type { Application, ApplicationStatus } from "../../shared/types/application";
import { formatCurrency } from "../../shared/utils/format";
import { CategoryBars } from "./components/CategoryBars";
import { Meter } from "./components/Meter";
import { StatTile } from "./components/StatTile";
import { WeeklyActivityChart } from "./components/WeeklyActivityChart";
import {
  computeAverageSalaryByStatus,
  computeConversionRates,
  computeFollowUpHealth,
  computeHighestSalaryOpportunities,
  computeSalaryRange,
  computeSourceCounts,
  computeSourcePerformance,
  computeStatusCounts,
  computeWeeklyActivity,
} from "./insightsMath";

type InsightsViewProps = {
  applications: Application[];
};

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Wishlist: "#eda100",
  Applied: "#2a78d6",
  Interviewing: "#4a3aa7",
  Offer: "#008300",
  Rejected: "#e34948",
};

const SEQUENTIAL_BLUE = "#2a78d6";

const formatPercent = (value: number | null) =>
  value === null ? "—" : `${Math.round(value * 100)}%`;

export function InsightsView({ applications }: InsightsViewProps) {
  const statusCounts = useMemo(() => computeStatusCounts(applications), [applications]);
  const averageSalaryByStatus = useMemo(
    () => computeAverageSalaryByStatus(applications),
    [applications]
  );
  const sourceCounts = useMemo(() => computeSourceCounts(applications), [applications]);
  const sourcePerformance = useMemo(
    () => computeSourcePerformance(applications),
    [applications]
  );
  const conversion = useMemo(() => computeConversionRates(applications), [applications]);
  const followUpHealth = useMemo(() => computeFollowUpHealth(applications), [applications]);
  const salaryRange = useMemo(() => computeSalaryRange(applications), [applications]);
  const highestOpportunities = useMemo(
    () => computeHighestSalaryOpportunities(applications),
    [applications]
  );
  const weeklyActivity = useMemo(() => computeWeeklyActivity(applications), [applications]);

  const statusOrder: ApplicationStatus[] = [
    "Wishlist",
    "Applied",
    "Interviewing",
    "Offer",
    "Rejected",
  ];

  const statusBarData = statusOrder.map((status) => ({
    label: status,
    value: statusCounts[status],
    color: STATUS_COLORS[status],
    displayValue: String(statusCounts[status]),
  }));

  const salaryBarData = averageSalaryByStatus
    .filter((datum) => datum.value > 0)
    .map((datum) => ({
      label: datum.label,
      value: datum.value,
      color: STATUS_COLORS[datum.label as ApplicationStatus],
      displayValue: formatCurrency(datum.value),
    }));

  const sourceBarData = sourceCounts.map((datum) => ({
    label: datum.label,
    value: datum.value,
    color: SEQUENTIAL_BLUE,
    displayValue: String(datum.value),
  }));

  const sourcePerformanceBarData = sourcePerformance.map((datum) => ({
    label: datum.source,
    value: datum.rate,
    color: SEQUENTIAL_BLUE,
    displayValue: `${Math.round(datum.rate * 100)}% (${datum.interviewedOrBetter}/${datum.total})`,
  }));

  return (
    <section className="insights-view">
      <div className="insights-kpi-row">
        <StatTile label="Total applications" value={String(conversion.totalApplications)} />
        <StatTile label="Interview rate" value={formatPercent(conversion.interviewRate)} sublabel="of applications submitted" />
        <StatTile label="Offer rate" value={formatPercent(conversion.offerRate)} sublabel="of applications submitted" />
        <StatTile label="Rejected" value={String(conversion.rejectedCount)} sublabel="applications" />
      </div>

      <div className="insights-grid">
        <div className="insights-card">
          <h2>Applications by status</h2>
          <p>How your pipeline breaks down right now.</p>
          <CategoryBars data={statusBarData} />
        </div>

        <div className="insights-card">
          <h2>Applications by source</h2>
          <p>Where your applications are coming from.</p>
          <CategoryBars data={sourceBarData} />
        </div>

        <div className="insights-card">
          <h2>Average salary by status</h2>
          <p>Mean expected salary among applications with a salary set.</p>
          <CategoryBars
            data={salaryBarData}
            emptyMessage="No salary data yet."
          />
        </div>

        <div className="insights-card">
          <h2>Salary snapshot</h2>
          <p>Range across all applications with a salary set.</p>
          {salaryRange ? (
            <>
              <div className="insights-kpi-row insights-kpi-row-compact">
                <StatTile label="Lowest" value={formatCurrency(salaryRange.min)} />
                <StatTile label="Median" value={formatCurrency(salaryRange.median)} />
                <StatTile label="Highest" value={formatCurrency(salaryRange.max)} />
              </div>
              <ol className="opportunity-list">
                {highestOpportunities.map((application) => (
                  <li key={application.id}>
                    <div>
                      <strong>{application.role}</strong>
                      <span>{application.company || "Unknown company"}</span>
                    </div>
                    <span className="opportunity-salary">
                      {formatCurrency(application.salary)}
                    </span>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <p className="chart-empty">No salary data yet.</p>
          )}
        </div>

        <div className="insights-card insights-card-wide">
          <h2>Source performance</h2>
          <p>Share of applications from each source that reached interviewing or offer.</p>
          <CategoryBars
            data={sourcePerformanceBarData}
            emptyMessage="No applications yet."
          />
        </div>

        <div className="insights-card insights-card-wide">
          <h2>Weekly application activity</h2>
          <p>Applications submitted per week.</p>
          <WeeklyActivityChart data={weeklyActivity} />
        </div>

        <div className="insights-card insights-card-wide">
          <h2>Follow-up health</h2>
          <p>
            Coverage across your {followUpHealth.total} active application
            {followUpHealth.total === 1 ? "" : "s"} (excludes Offer / Rejected).
          </p>
          <div className="insights-meter-row">
            <Meter
              label="Has a follow-up date"
              percent={followUpHealth.followUpRate}
              sublabel="of active applications"
            />
            <Meter
              label="Has a contact"
              percent={followUpHealth.contactRate}
              sublabel="of active applications"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

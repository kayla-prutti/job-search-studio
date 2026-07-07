import type { WeeklyActivityDatum } from "../insightsMath";

type WeeklyActivityChartProps = {
  data: WeeklyActivityDatum[];
};

export function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
  if (data.length === 0) {
    return <p className="chart-empty">No application activity yet.</p>;
  }

  const maxValue = Math.max(...data.map((datum) => datum.count), 1);

  return (
    <div className="weekly-chart">
      {data.map((datum) => (
        <div className="weekly-chart-column" key={datum.weekLabel} tabIndex={0}>
          <span className="weekly-chart-value">{datum.count}</span>
          <div className="weekly-chart-track">
            <div
              className="weekly-chart-bar"
              style={{ height: `${(datum.count / maxValue) * 100}%` }}
            />
          </div>
          <span className="weekly-chart-label">{datum.weekLabel}</span>
        </div>
      ))}
    </div>
  );
}

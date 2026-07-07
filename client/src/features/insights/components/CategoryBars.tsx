type CategoryBarsDatum = {
  label: string;
  value: number;
  color: string;
  displayValue: string;
};

type CategoryBarsProps = {
  data: CategoryBarsDatum[];
  emptyMessage?: string;
};

export function CategoryBars({ data, emptyMessage }: CategoryBarsProps) {
  if (data.length === 0) {
    return <p className="chart-empty">{emptyMessage ?? "No data yet."}</p>;
  }

  const maxValue = Math.max(...data.map((datum) => datum.value), 1);

  return (
    <div className="category-bars">
      {data.map((datum) => (
        <div className="category-bar-row" key={datum.label} tabIndex={0}>
          <span className="category-bar-label">{datum.label}</span>
          <div className="category-bar-track">
            <div
              className="category-bar-fill"
              style={{
                background: datum.color,
                width: `${(datum.value / maxValue) * 100}%`,
              }}
            />
          </div>
          <span className="category-bar-value">{datum.displayValue}</span>
        </div>
      ))}
    </div>
  );
}

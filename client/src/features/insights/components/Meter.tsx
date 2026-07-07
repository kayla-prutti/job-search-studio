type MeterProps = {
  label: string;
  percent: number | null;
  sublabel: string;
};

export function Meter({ label, percent, sublabel }: MeterProps) {
  const displayPercent = percent === null ? 0 : Math.round(percent * 100);

  return (
    <div className="meter">
      <div className="meter-header">
        <span className="meter-label">{label}</span>
        <strong className="meter-value">
          {percent === null ? "—" : `${displayPercent}%`}
        </strong>
      </div>
      <div
        aria-label={label}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={displayPercent}
        className="meter-track"
        role="progressbar"
      >
        <div className="meter-fill" style={{ width: `${displayPercent}%` }} />
      </div>
      <span className="meter-sublabel">{sublabel}</span>
    </div>
  );
}

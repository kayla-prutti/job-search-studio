type ApplicationsToolbarProps = {
  quickFilter: string;
  onQuickFilterChange: (value: string) => void;
};

export function ApplicationsToolbar({
  quickFilter,
  onQuickFilterChange,
}: ApplicationsToolbarProps) {
  return (
    <section className="toolbar">
      <div>
        <h2>Applications</h2>
      </div>
      <input
        aria-label="Search applications"
        placeholder="Search role, company, contact..."
        value={quickFilter}
        onChange={(event) => onQuickFilterChange(event.target.value)}
      />
    </section>
  );
}

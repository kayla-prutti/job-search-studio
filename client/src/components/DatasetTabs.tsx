export function DatasetTabs() {
  return (
    <nav className="tabs" aria-label="Dataset views">
      <button className="active">Applications table</button>
      <button>Pipeline</button>
      <button>Version history</button>
      <button>Diff</button>
    </nav>
  );
}

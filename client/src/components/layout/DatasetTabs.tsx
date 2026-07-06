export type DatasetView = "table" | "board" | "history" | "diff";

type DatasetTabsProps = {
  activeView: DatasetView;
  onViewChange: (view: DatasetView) => void;
};

const tabs: Array<{ label: string; value: DatasetView }> = [
  { label: "Applications table", value: "table" },
  { label: "Status board", value: "board" },
  { label: "Version history", value: "history" },
  { label: "Diff", value: "diff" },
];

export function DatasetTabs({ activeView, onViewChange }: DatasetTabsProps) {
  return (
    <nav className="tabs" aria-label="Dataset views">
      {tabs.map((tab) => (
        <button
          className={activeView === tab.value ? "active" : ""}
          key={tab.value}
          onClick={() => onViewChange(tab.value)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

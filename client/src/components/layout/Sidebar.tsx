import { ChevronLeft, ChevronRight } from "lucide-react";
import { statusOptions } from "../../shared/constants/applicationOptions";
import type { ApplicationStatus } from "../../shared/types/application";

type SidebarProps = {
  applicationCount: number;
  statusCounts: Record<ApplicationStatus, number>;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
};

export function Sidebar({
  applicationCount,
  statusCounts,
  isCollapsed,
  onToggleCollapsed,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <button
        aria-label={
          isCollapsed ? "Expand workspace sidebar" : "Collapse workspace sidebar"
        }
        className="collapse-button"
        onClick={onToggleCollapsed}
        type="button"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className="sidebar-section">
        <span className="eyebrow">Workspace</span>
        <button className="workspace-card active">
          <strong>2026 SWE Search</strong>
          <span>{applicationCount} applications</span>
        </button>
      </div>

      <div className="sidebar-section">
        <span className="eyebrow">Status totals</span>
        {statusOptions.map((status) => (
          <div
            className={`metric-card status-card status-card-${status.toLowerCase()}`}
            key={status}
          >
            <strong>{statusCounts[status]}</strong>
            <span>{status}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

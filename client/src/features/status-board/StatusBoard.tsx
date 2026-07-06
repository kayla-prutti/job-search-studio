import { useState } from "react";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { statusOptions } from "../../shared/constants/applicationOptions";
import type {
  Application,
  ApplicationStatus,
} from "../../shared/types/application";
import { formatCurrency } from "../../shared/utils/format";

type StatusBoardProps = {
  applications: Application[];
  onEdit: (application: Application) => void;
  onStatusChange: (application: Application, status: ApplicationStatus) => void;
};

export function StatusBoard({
  applications,
  onEdit,
  onStatusChange,
}: StatusBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] =
    useState<ApplicationStatus | null>(null);

  const handleDrop = (status: ApplicationStatus) => {
    const application = applications.find(({ id }) => id === draggingId);

    if (application && application.status !== status) {
      onStatusChange(application, status);
    }

    setDraggingId(null);
    setDragOverStatus(null);
  };

  return (
    <section className="board-view" aria-label="Status board">
      {statusOptions.map((status) => {
        const statusApplications = applications.filter(
          (application) => application.status === status
        );

        return (
          <div
            className={`board-column ${
              dragOverStatus === status ? "drag-over" : ""
            }`}
            key={status}
            onDragLeave={() => setDragOverStatus(null)}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOverStatus(status);
            }}
            onDrop={() => handleDrop(status)}
          >
            <div className="board-column-header">
              <StatusBadge value={status} />
              <span>{statusApplications.length}</span>
            </div>

            <div className="board-card-list">
              {statusApplications.map((application) => (
                <button
                  className="board-card"
                  draggable
                  key={application.id}
                  onClick={() => onEdit(application)}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setDragOverStatus(null);
                  }}
                  onDragStart={() => setDraggingId(application.id)}
                  type="button"
                >
                  <strong>{application.role}</strong>
                  <span>{application.company || "Unknown company"}</span>
                  <div className="board-card-meta">
                    <small>{formatCurrency(application.salary)}</small>
                    <small>{application.priority}</small>
                  </div>
                </button>
              ))}

              {statusApplications.length === 0 && (
                <div className="board-empty">Drop applications here</div>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

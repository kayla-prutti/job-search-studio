import { Trash2 } from "lucide-react";
import type { Application } from "../types/application";

type DeleteApplicationModalProps = {
  application: Application;
  isSaving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteApplicationModal({
  application,
  isSaving,
  onCancel,
  onConfirm,
}: DeleteApplicationModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="delete-application-title"
        className="modal confirm-modal"
        role="dialog"
      >
        <div className="warning-icon">
          <Trash2 size={22} />
        </div>
        <h2 id="delete-application-title">Delete application?</h2>
        <p>
          This will remove <strong>{application.role}</strong> at{" "}
          <strong>{application.company || "Unknown company"}</strong> from the
          current job tracking.
        </p>
        <footer className="modal-footer">
          <button className="secondary-button" onClick={onCancel} type="button">
            Cancel
          </button>
          <button
            className="danger-button"
            disabled={isSaving}
            onClick={onConfirm}
            type="button"
          >
            {isSaving ? "Deleting..." : "Delete application"}
          </button>
        </footer>
      </section>
    </div>
  );
}

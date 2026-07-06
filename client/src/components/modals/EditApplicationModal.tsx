import { X } from "lucide-react";
import {
  priorityOptions,
  sourceOptions,
  statusOptions,
} from "../../shared/constants/applicationOptions";
import type {
  Application,
  ApplicationStatus,
  Priority,
} from "../../shared/types/application";
import { fromInputDate, toInputDate } from "../../shared/utils/format";

type EditApplicationModalProps = {
  application: Application;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
  onUpdate: (updates: Partial<Application>) => void;
};

export function EditApplicationModal({
  application,
  isSaving,
  onCancel,
  onSave,
  onUpdate,
}: EditApplicationModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="edit-application-title"
        className="modal edit-modal"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <span>Edit application</span>
            <h2 id="edit-application-title">{application.role}</h2>
          </div>
          <button
            aria-label="Close edit modal"
            className="ghost-icon-button"
            onClick={onCancel}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="form-grid">
          <label>
            Role
            <input
              value={application.role}
              onChange={(event) => onUpdate({ role: event.target.value })}
            />
          </label>

          <label>
            Company
            <input
              className={application.company ? "" : "invalid-input"}
              value={application.company}
              onChange={(event) => onUpdate({ company: event.target.value })}
            />
            {!application.company && (
              <small className="field-error">Company is required</small>
            )}
          </label>

          <label className="full-field">
            Job URL
            <input
              value={application.jobUrl}
              onChange={(event) => onUpdate({ jobUrl: event.target.value })}
            />
          </label>

          <label>
            Expected salary
            <input
              type="number"
              value={application.salary}
              onChange={(event) =>
                onUpdate({ salary: Number(event.target.value) })
              }
            />
          </label>

          <label>
            Status
            <select
              value={application.status}
              onChange={(event) =>
                onUpdate({ status: event.target.value as ApplicationStatus })
              }
            >
              {statusOptions.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>

          <label>
            Applied date
            <input
              type="date"
              value={toInputDate(application.appliedDate)}
              onChange={(event) =>
                onUpdate({ appliedDate: fromInputDate(event.target.value) })
              }
            />
          </label>

          <label>
            Follow-up date
            <input
              type="date"
              value={toInputDate(application.followUpDate)}
              onChange={(event) =>
                onUpdate({ followUpDate: fromInputDate(event.target.value) })
              }
            />
            {application.status === "Interviewing" &&
              !application.followUpDate && (
                <small className="field-error">
                  Set a follow-up date for interviewing roles
                </small>
              )}
          </label>

          <label>
            Contact
            <input
              value={application.contact ?? ""}
              onChange={(event) =>
                onUpdate({ contact: event.target.value || null })
              }
            />
          </label>

          <label className="full-field">
            Notes
            <textarea
              rows={3}
              value={application.notes ?? ""}
              onChange={(event) =>
                onUpdate({ notes: event.target.value || null })
              }
            />
          </label>

          <label>
            Source
            <select
              value={application.source}
              onChange={(event) => onUpdate({ source: event.target.value })}
            >
              {sourceOptions.map((source) => (
                <option key={source}>{source}</option>
              ))}
            </select>
          </label>

          <label>
            Priority
            <select
              value={application.priority}
              onChange={(event) =>
                onUpdate({ priority: event.target.value as Priority })
              }
            >
              {priorityOptions.map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </select>
          </label>
        </div>

        <footer className="modal-footer">
          <button className="secondary-button" onClick={onCancel} type="button">
            Cancel
          </button>
          <button
            className="primary-button"
            disabled={isSaving || !application.company}
            onClick={onSave}
            type="button"
          >
            {isSaving ? "Saving..." : "Save application"}
          </button>
        </footer>
      </section>
    </div>
  );
}

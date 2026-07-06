import { X } from "lucide-react";

type ImportJobUrlModalProps = {
  isSaving: boolean;
  jobDescriptionUrl: string;
  onCancel: () => void;
  onExtract: () => void;
  onJobDescriptionUrlChange: (value: string) => void;
};

export function ImportJobUrlModal({
  isSaving,
  jobDescriptionUrl,
  onCancel,
  onExtract,
  onJobDescriptionUrlChange,
}: ImportJobUrlModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="import-job-title"
        className="modal import-modal"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <span>Add from job URL</span>
            <h2 id="import-job-title">Extract job details</h2>
          </div>
          <button
            aria-label="Close URL modal"
            className="ghost-icon-button"
            onClick={onCancel}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="import-body">
          <p>
            Paste a job posting URL. Job Search Studio will read the page title
            when possible, create a draft row, and open it for review.
          </p>
          <label>
            Job posting URL
            <input
              autoFocus
              placeholder="https://company.com/careers/job-id"
              value={jobDescriptionUrl}
              onChange={(event) =>
                onJobDescriptionUrlChange(event.target.value)
              }
            />
          </label>
        </div>

        <footer className="modal-footer">
          <button className="secondary-button" onClick={onCancel} type="button">
            Cancel
          </button>
          <button
            className="primary-button"
            disabled={isSaving || !jobDescriptionUrl}
            onClick={onExtract}
            type="button"
          >
            {isSaving ? "Extracting..." : "Extract details"}
          </button>
        </footer>
      </section>
    </div>
  );
}

import { Link } from "lucide-react";

type AppHeaderProps = {
  onAddJobUrl: () => void;
};

export function AppHeader({ onAddJobUrl }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="brand-mark">JS</div>
      <div>
        <h1>Job Search Studio</h1>
        <p>2026 SWE Search</p>
      </div>
      <div className="header-actions">
        <div className="tooltip-wrap">
          <button
            aria-describedby="add-job-url-tooltip"
            className="primary-button"
            onClick={onAddJobUrl}
            type="button"
          >
            <Link size={16} />
            Add job URL
          </button>
          <div className="tooltip" id="add-job-url-tooltip" role="tooltip">
            Paste a job posting URL so the app can extract role, company,
            salary, and description details.
          </div>
        </div>
      </div>
    </header>
  );
}

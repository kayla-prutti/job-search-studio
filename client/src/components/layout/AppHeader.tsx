import { LogOut, Link } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type AppHeaderProps = {
  onAddJobUrl: () => void;
  onLogout: () => void;
  userEmail: string;
};

export function AppHeader({ onAddJobUrl, onLogout, userEmail }: AppHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initial = userEmail.trim().charAt(0).toUpperCase() || "?";

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

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
        <div className="user-menu" ref={menuRef}>
          <button
            aria-expanded={isMenuOpen}
            aria-label="Account menu"
            className="avatar-button"
            onClick={() => setIsMenuOpen((current) => !current)}
            type="button"
          >
            {initial}
          </button>
          {isMenuOpen && (
            <div className="user-menu-dropdown" role="menu">
              <span className="user-menu-email">{userEmail}</span>
              <button
                className="user-menu-logout"
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
                role="menuitem"
                type="button"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

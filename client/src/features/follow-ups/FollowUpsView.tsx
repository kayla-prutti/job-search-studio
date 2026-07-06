import type { Application } from "../../shared/types/application";
import { StatusBadge } from "../../components/ui/StatusBadge";

type FollowUpsViewProps = {
  applications: Application[];
  onEdit: (application: Application) => void;
};

type FollowUpSection = {
  description: string;
  items: Application[];
  title: string;
};

const today = new Date("2026-07-06T00:00:00");
const soonCutoff = new Date(today);
soonCutoff.setDate(today.getDate() + 7);
const staleCutoff = new Date(today);
staleCutoff.setDate(today.getDate() - 21);

const parseDate = (value: string | null) => (value ? new Date(`${value}T00:00:00`) : null);

const isActiveApplication = (application: Application) =>
  application.status !== "Offer" && application.status !== "Rejected";

export function FollowUpsView({ applications, onEdit }: FollowUpsViewProps) {
  const activeApplications = applications.filter(isActiveApplication);
  const sections: FollowUpSection[] = [
    {
      title: "Overdue follow-ups",
      description: "Follow-up dates before today.",
      items: activeApplications.filter((application) => {
        const followUpDate = parseDate(application.followUpDate);
        return followUpDate !== null && followUpDate < today;
      }),
    },
    {
      title: "Due this week",
      description: "Follow-ups scheduled in the next 7 days.",
      items: activeApplications.filter((application) => {
        const followUpDate = parseDate(application.followUpDate);
        return (
          followUpDate !== null &&
          followUpDate >= today &&
          followUpDate <= soonCutoff
        );
      }),
    },
    {
      title: "Missing contact",
      description: "Applications without a recruiter or contact name.",
      items: activeApplications.filter((application) => !application.contact),
    },
    {
      title: "Interviewing without next step",
      description: "Interviewing roles that need a follow-up date.",
      items: applications.filter(
        (application) =>
          application.status === "Interviewing" && !application.followUpDate
      ),
    },
    {
      title: "Stale applications",
      description: "Applied roles older than 21 days with no follow-up date.",
      items: activeApplications.filter((application) => {
        const appliedDate = parseDate(application.appliedDate);
        return (
          application.status === "Applied" &&
          appliedDate !== null &&
          appliedDate < staleCutoff &&
          !application.followUpDate
        );
      }),
    },
  ];

  return (
    <section className="followups-view">
      {sections.map((section) => (
        <div className="followup-section" key={section.title}>
          <div className="followup-section-header">
            <div>
              <h2>{section.title}</h2>
              <p>{section.description}</p>
            </div>
            <span>{section.items.length}</span>
          </div>

          <div className="followup-list">
            {section.items.length > 0 ? (
              section.items.map((application) => (
                <button
                  className="followup-item"
                  key={`${section.title}-${application.id}`}
                  onClick={() => onEdit(application)}
                  type="button"
                >
                  <div>
                    <strong>{application.role}</strong>
                    <span>{application.company || "Unknown company"}</span>
                  </div>
                  <div className="followup-meta">
                    <StatusBadge value={application.status} />
                    <small>
                      Follow-up: {application.followUpDate ?? "Not set"}
                    </small>
                    <small>Contact: {application.contact ?? "Missing"}</small>
                  </div>
                </button>
              ))
            ) : (
              <div className="followup-empty">No applications here.</div>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}

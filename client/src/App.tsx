import { useEffect, useMemo, useState } from "react";
import { statusOptions } from "./shared/constants/applicationOptions";
import type {
  Application,
  ApplicationStatus,
  ExtractJobUrlResponse,
} from "./shared/types/application";
import type { User } from "./shared/types/auth";
import { AppHeader } from "./components/layout/AppHeader";
import { DatasetTabs, type DatasetView } from "./components/layout/DatasetTabs";
import { Sidebar } from "./components/layout/Sidebar";
import { DeleteApplicationModal } from "./components/modals/DeleteApplicationModal";
import { EditApplicationModal } from "./components/modals/EditApplicationModal";
import { ImportJobUrlModal } from "./components/modals/ImportJobUrlModal";
import { ApplicationsGrid } from "./features/applications-table/ApplicationsGrid";
import { ApplicationsToolbar } from "./features/applications-table/ApplicationsToolbar";
import { LoginPage } from "./features/auth/LoginPage";
import { FollowUpsView } from "./features/follow-ups/FollowUpsView";
import { InsightsView } from "./features/insights/InsightsView";
import { StatusBoard } from "./features/status-board/StatusBoard";
import "./styles.css";

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [quickFilter, setQuickFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null);
  const [deleteApplication, setDeleteApplication] =
    useState<Application | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [jobDescriptionUrl, setJobDescriptionUrl] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeView, setActiveView] = useState<DatasetView>("table");

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me");

        if (response.ok) {
          const data = (await response.json()) as { user: User };
          setCurrentUser(data.user);
        }
      } finally {
        setIsAuthChecked(true);
      }
    }

    void checkAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    async function loadApplications() {
      try {
        const response = await fetch("/api/applications");

        if (!response.ok) {
          throw new Error("Unable to load applications from the API.");
        }

        const data = (await response.json()) as { applications: Application[] };
        setApplications(data.applications);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected load error.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadApplications();
  }, [currentUser]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    setApplications([]);
    setIsLoading(true);
  };

  const statusCounts = useMemo(
    () =>
      statusOptions.reduce<Record<ApplicationStatus, number>>(
        (totals, status) => {
          totals[status] = applications.filter(
            (application) => application.status === status
          ).length;
          return totals;
        },
        {
          Wishlist: 0,
          Applied: 0,
          Interviewing: 0,
          Offer: 0,
          Rejected: 0,
        }
      ),
    [applications]
  );

  const updateEditingApplication = (updates: Partial<Application>) => {
    setEditingApplication((current) =>
      current ? { ...current, ...updates } : current
    );
  };

  const saveApplication = async () => {
    if (!editingApplication) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/applications/${editingApplication.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingApplication),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to save application.");
      }

      const data = (await response.json()) as { application: Application };

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === data.application.id
            ? data.application
            : application
        )
      );
      setEditingApplication(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteApplication = async () => {
    if (!deleteApplication) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/applications/${deleteApplication.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to delete application.");
      }

      setApplications((currentApplications) =>
        currentApplications.filter(
          (application) => application.id !== deleteApplication.id
        )
      );
      setDeleteApplication(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateApplicationStatus = async (
    application: Application,
    status: ApplicationStatus
  ) => {
    const previousApplications = applications;

    setApplications((currentApplications) =>
      currentApplications.map((currentApplication) =>
        currentApplication.id === application.id
          ? { ...currentApplication, status }
          : currentApplication
      )
    );

    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Unable to update application status.");
      }

      const data = (await response.json()) as { application: Application };

      setApplications((currentApplications) =>
        currentApplications.map((currentApplication) =>
          currentApplication.id === data.application.id
            ? data.application
            : currentApplication
        )
      );
    } catch (err) {
      setApplications(previousApplications);
      setError(err instanceof Error ? err.message : "Status update failed.");
    }
  };

  const extractJobUrl = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const extractResponse = await fetch("/api/job-url/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: jobDescriptionUrl }),
      });

      if (!extractResponse.ok) {
        const data = (await extractResponse.json()) as { error?: string };
        throw new Error(data.error ?? "Unable to extract job details.");
      }

      const extracted = (await extractResponse.json()) as ExtractJobUrlResponse;

      const createResponse = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(extracted.application),
      });

      if (!createResponse.ok) {
        throw new Error("Unable to create application from URL.");
      }

      const data = (await createResponse.json()) as { application: Application };

      setApplications((currentApplications) => [
        data.application,
        ...currentApplications,
      ]);
      setJobDescriptionUrl("");
      setIsImportModalOpen(false);
      setEditingApplication(data.application);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthChecked) {
    return null;
  }

  if (!currentUser) {
    return <LoginPage onAuthenticated={setCurrentUser} />;
  }

  return (
    <div
      className={`app-shell ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      <AppHeader
        onAddJobUrl={() => setIsImportModalOpen(true)}
        onLogout={logout}
        userEmail={currentUser.email}
      />

      <Sidebar
        applicationCount={applications.length}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapsed={() =>
          setIsSidebarCollapsed((current) => !current)
        }
        statusCounts={statusCounts}
      />

      <main className="content">
        <DatasetTabs activeView={activeView} onViewChange={setActiveView} />

        {activeView === "table" ? (
          <>
            <ApplicationsToolbar
              onQuickFilterChange={setQuickFilter}
              quickFilter={quickFilter}
            />
            <section className="grid-card">
              <ApplicationsGrid
                applications={applications}
                error={error}
                isLoading={isLoading}
                onDelete={setDeleteApplication}
                onEdit={setEditingApplication}
                quickFilter={quickFilter}
              />
            </section>
          </>
        ) : activeView === "board" ? (
          <StatusBoard
            applications={applications}
            onEdit={setEditingApplication}
            onStatusChange={updateApplicationStatus}
          />
        ) : activeView === "followups" ? (
          <FollowUpsView
            applications={applications}
            onEdit={setEditingApplication}
          />
        ) : (
          <InsightsView applications={applications} />
        )}
      </main>

      {editingApplication && (
        <EditApplicationModal
          application={editingApplication}
          isSaving={isSaving}
          onCancel={() => setEditingApplication(null)}
          onSave={saveApplication}
          onUpdate={updateEditingApplication}
        />
      )}

      {isImportModalOpen && (
        <ImportJobUrlModal
          isSaving={isSaving}
          jobDescriptionUrl={jobDescriptionUrl}
          onCancel={() => setIsImportModalOpen(false)}
          onExtract={extractJobUrl}
          onJobDescriptionUrlChange={setJobDescriptionUrl}
        />
      )}

      {deleteApplication && (
        <DeleteApplicationModal
          application={deleteApplication}
          isSaving={isSaving}
          onCancel={() => setDeleteApplication(null)}
          onConfirm={confirmDeleteApplication}
        />
      )}
    </div>
  );
}

export default App;

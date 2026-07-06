import { db } from "./db.js";
import type {
  Application,
  ApplicationStatus,
  Priority,
  UpdateApplicationInput,
} from "./types.js";

type ApplicationRow = Application;

type ListFilters = {
  status?: ApplicationStatus;
  priority?: Priority;
  validationStatus?: Application["validationStatus"];
  search?: string;
};

const listStatement = db.prepare("SELECT * FROM applications ORDER BY rowid");
const getStatement = db.prepare("SELECT * FROM applications WHERE id = ?");
const insertStatement = db.prepare(`
  INSERT INTO applications
    (id, role, company, salary, status, appliedDate, followUpDate, contact, notes, source, priority, jobUrl, validationStatus)
  VALUES
    (@id, @role, @company, @salary, @status, @appliedDate, @followUpDate, @contact, @notes, @source, @priority, @jobUrl, @validationStatus)
`);
const deleteStatement = db.prepare("DELETE FROM applications WHERE id = ?");

export const listApplications = (filters: ListFilters): Application[] => {
  let results = listStatement.all() as ApplicationRow[];

  if (filters.status) {
    results = results.filter((application) => application.status === filters.status);
  }

  if (filters.priority) {
    results = results.filter((application) => application.priority === filters.priority);
  }

  if (filters.validationStatus) {
    results = results.filter(
      (application) => application.validationStatus === filters.validationStatus
    );
  }

  if (filters.search) {
    const normalizedSearch = filters.search.toLowerCase();
    results = results.filter(
      (application) =>
        application.role.toLowerCase().includes(normalizedSearch) ||
        application.company.toLowerCase().includes(normalizedSearch)
    );
  }

  return results;
};

export const getApplication = (id: string): Application | undefined =>
  getStatement.get(id) as ApplicationRow | undefined;

export const createApplication = (application: Application): Application => {
  insertStatement.run(application);
  return application;
};

export const updateApplication = (
  id: string,
  updates: UpdateApplicationInput
): Application | undefined => {
  const existing = getApplication(id);

  if (!existing) {
    return undefined;
  }

  const updated: Application = { ...existing, ...updates, id };
  const setClause = Object.keys(updates)
    .filter((key) => key !== "id")
    .map((key) => `${key} = @${key}`)
    .join(", ");

  if (setClause) {
    db.prepare(`UPDATE applications SET ${setClause} WHERE id = @id`).run(updated);
  }

  return updated;
};

export const deleteApplication = (id: string): boolean =>
  deleteStatement.run(id).changes > 0;
http://127.0.0.1:5173/
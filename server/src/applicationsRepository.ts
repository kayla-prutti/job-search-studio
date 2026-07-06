import { db } from "./db.js";
import type {
  Application,
  ApplicationStatus,
  Priority,
  UpdateApplicationInput,
} from "./types.js";

const applicationColumns =
  "id, role, company, salary, status, appliedDate, followUpDate, contact, notes, source, priority, jobUrl, validationStatus";

type ListFilters = {
  status?: ApplicationStatus;
  priority?: Priority;
  validationStatus?: Application["validationStatus"];
  search?: string;
};

const listStatement = db.prepare(
  `SELECT ${applicationColumns} FROM applications WHERE userId = ? ORDER BY rowid`
);
const getStatement = db.prepare(
  `SELECT ${applicationColumns} FROM applications WHERE userId = ? AND id = ?`
);
const insertStatement = db.prepare(`
  INSERT INTO applications
    (id, userId, role, company, salary, status, appliedDate, followUpDate, contact, notes, source, priority, jobUrl, validationStatus)
  VALUES
    (@id, @userId, @role, @company, @salary, @status, @appliedDate, @followUpDate, @contact, @notes, @source, @priority, @jobUrl, @validationStatus)
`);
const deleteStatement = db.prepare(
  "DELETE FROM applications WHERE userId = ? AND id = ?"
);

export const listApplications = (
  userId: string,
  filters: ListFilters
): Application[] => {
  let results = listStatement.all(userId) as Application[];

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

export const getApplication = (
  userId: string,
  id: string
): Application | undefined =>
  getStatement.get(userId, id) as Application | undefined;

export const createApplication = (
  userId: string,
  application: Application
): Application => {
  insertStatement.run({ ...application, userId });
  return application;
};

export const updateApplication = (
  userId: string,
  id: string,
  updates: UpdateApplicationInput
): Application | undefined => {
  const existing = getApplication(userId, id);

  if (!existing) {
    return undefined;
  }

  const updated: Application = { ...existing, ...updates, id };
  const setClause = Object.keys(updates)
    .filter((key) => key !== "id")
    .map((key) => `${key} = @${key}`)
    .join(", ");

  if (setClause) {
    db.prepare(
      `UPDATE applications SET ${setClause} WHERE id = @id AND userId = @userId`
    ).run({ ...updated, userId });
  }

  return updated;
};

export const deleteApplication = (userId: string, id: string): boolean =>
  deleteStatement.run(userId, id).changes > 0;

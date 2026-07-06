import { randomUUID } from "node:crypto";
import { db } from "./db.js";

export const SESSION_COOKIE_NAME = "sid";
export const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const insertSessionStatement = db.prepare(`
  INSERT INTO sessions (id, userId, expiresAt)
  VALUES (@id, @userId, @expiresAt)
`);
const getSessionStatement = db.prepare("SELECT * FROM sessions WHERE id = ?");
const deleteSessionStatement = db.prepare("DELETE FROM sessions WHERE id = ?");

export const createSession = (userId: string) => {
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS).toISOString();

  insertSessionStatement.run({ id, userId, expiresAt });

  return { id, expiresAt };
};

export const getSessionUserId = (sessionId: string): string | undefined => {
  const session = getSessionStatement.get(sessionId) as
    | { id: string; userId: string; expiresAt: string }
    | undefined;

  if (!session) {
    return undefined;
  }

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    deleteSessionStatement.run(sessionId);
    return undefined;
  }

  return session.userId;
};

export const deleteSession = (sessionId: string) => {
  deleteSessionStatement.run(sessionId);
};

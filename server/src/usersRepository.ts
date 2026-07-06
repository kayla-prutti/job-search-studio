import { db } from "./db.js";
import type { User } from "./types.js";

type UserRecord = User & { passwordHash: string };

const insertStatement = db.prepare(`
  INSERT INTO users (id, email, passwordHash, createdAt)
  VALUES (@id, @email, @passwordHash, @createdAt)
`);
const getByEmailStatement = db.prepare(
  "SELECT * FROM users WHERE email = ?"
);
const getByIdStatement = db.prepare(
  "SELECT id, email, createdAt FROM users WHERE id = ?"
);

const createUserId = () => `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const createUser = (email: string, passwordHash: string): User => {
  const user: UserRecord = {
    id: createUserId(),
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  insertStatement.run(user);

  return { id: user.id, email: user.email, createdAt: user.createdAt };
};

export const getUserByEmailWithPassword = (
  email: string
): UserRecord | undefined =>
  getByEmailStatement.get(email) as UserRecord | undefined;

export const getUserById = (id: string): User | undefined =>
  getByIdStatement.get(id) as User | undefined;

import { db } from "./db";

export const DEFAULT_USER_ID = "user-tom";

export async function getCurrentUserId(): Promise<string> {
  return DEFAULT_USER_ID;
}

export async function getCurrentUser() {
  return db.user.findUniqueOrThrow({
    where: { id: DEFAULT_USER_ID },
  });
}
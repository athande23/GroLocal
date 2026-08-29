import { cookies } from "next/headers";
import { db } from "./db";

export const DEFAULT_USER_ID = "user-tom";

// The three demo personas selectable from the header switcher.
export const SWITCHABLE_USER_IDS = ["user-tom", "user-priya", "user-giuseppe"];

export async function getCurrentUserId(): Promise<string> {
  const store = await cookies();
  return store.get("grolocal-user")?.value ?? DEFAULT_USER_ID;
}

export async function getCurrentUser() {
  const id = await getCurrentUserId();
  const user = await db.user.findUnique({ where: { id } });
  if (user) return user;
  return db.user.findUniqueOrThrow({ where: { id: DEFAULT_USER_ID } });
}

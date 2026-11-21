"use client";

/**
 * The logged-in user's first name and unread notification count for client
 * components (the header and the notification bell, spec 016). Read on the
 * server by the root layout; nothing is stored in the browser.
 */
import { createContext, useContext, type ReactNode } from "react";

export type SessionUser = { firstName: string; unreadNotifications: number } | null;

const UserContext = createContext<SessionUser>(null);

export function UserProvider({ user, children }: { user: SessionUser; children: ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export const useSessionUser = () => useContext(UserContext);

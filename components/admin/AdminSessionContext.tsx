"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAdminSession } from "./useAdminSession";

type AdminSessionValue = ReturnType<typeof useAdminSession>;

const AdminSessionContext = createContext<AdminSessionValue | null>(null);

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const session = useAdminSession();
  return <AdminSessionContext.Provider value={session}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSessionContext() {
  const context = useContext(AdminSessionContext);
  if (!context) throw new Error("useAdminSessionContext must be used within AdminSessionProvider");
  return context;
}

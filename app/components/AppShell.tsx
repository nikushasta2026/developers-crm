"use client";

import { SessionProvider } from "next-auth/react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SessionProvider>
  );
}

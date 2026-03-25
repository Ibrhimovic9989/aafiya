"use client";

import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { ConditionProvider } from "@/components/ConditionProvider";
import { NotificationPrompt } from "@/components/NotificationPrompt";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ConditionProvider>
      <NotificationPrompt />
      <main className="flex-1 pb-safe">{children}</main>
      <BottomNav />
    </ConditionProvider>
  );
}

// components/AppShell.tsx
"use client";

import { SearchProvider } from "@/contexts/SearchContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      {children}
    </SearchProvider>
  );
}
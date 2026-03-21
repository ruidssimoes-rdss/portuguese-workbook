/**
 * PageShell — wraps every page in sidebar + scrollable content area.
 * Usage: <PageShell>...page content...</PageShell>
 *
 * The lesson player (/lessons/[id]) does NOT use this — it's full-screen.
 */

import { Sidebar } from "./sidebar";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-10 pt-8 pb-16 max-md:px-4 max-md:pt-6">
        <div className="max-w-[960px]">
          {children}
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SearchModal } from "@/components/search-modal";
import type { ExplorerTree } from "@/lib/shell/types";
import { Explorer } from "./explorer";
import { Header } from "./header";

/**
 * The app frame: Explorer (left), Header + note (centre), Panel (right).
 * Lives in the (app) layout, so it never re-mounts between pages.
 */
export function Shell({
  tree,
  header,
  panel,
  children,
}: {
  tree: ExplorerTree;
  header: React.ReactNode;
  panel: React.ReactNode;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const noteRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
      if (e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "[") {
        e.preventDefault();
        router.back();
      } else if (e.key === "]") {
        e.preventDefault();
        router.forward();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [router]);

  // A new note starts at the top
  useEffect(() => {
    noteRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="flex h-dvh overflow-hidden bg-surface-page text-text-primary">
      <Explorer tree={tree} onSearch={() => setSearchOpen(true)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header>{header}</Header>
        <main ref={noteRef} id="nota" className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      {panel}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

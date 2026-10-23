"use client";

import { Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PageShell } from "@/components/layout/page-shell";
import { BookProvider, useBook } from "./book-context";
import { CardPane } from "./card-pane";
import { PracticePane } from "./practice-pane";

function useWideDock() {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const apply = () => setWide(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);
  return wide;
}

function Shell({
  header,
  children,
  fallback,
  lessonTitle,
  renderLesson,
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  lessonTitle?: string;
  renderLesson?: (args: { onDismiss: () => void }) => React.ReactNode;
}) {
  const book = useBook();
  const wide = useWideDock();
  const practicing = Boolean(book.practice);
  const dock = practicing && wide ? (
    <div className="flex min-h-0 flex-1 flex-col">
      <PracticePane lessonTitle={lessonTitle} renderLesson={renderLesson} />
    </div>
  ) : book.current && wide ? (
    <div className="flex min-h-0 flex-1 flex-col">
      <CardPane />
    </div>
  ) : !book.current && !practicing && fallback ? (
    <div className="min-h-0 flex-1 overflow-y-auto p-4">{fallback}</div>
  ) : null;

  const cover = "fixed inset-0 z-[60] flex min-h-0 flex-col bg-white lg:hidden";

  return (
    <PageShell header={header} dock={dock} wideDock={practicing && wide}>
      {children}
      {!wide &&
        practicing &&
        createPortal(
          <div className={cover}>
            <PracticePane lessonTitle={lessonTitle} renderLesson={renderLesson} />
          </div>,
          document.body,
        )}
      {!wide &&
        !practicing &&
        book.current &&
        createPortal(
          <div className={cover}>
            <CardPane />
          </div>,
          document.body,
        )}
    </PageShell>
  );
}

/**
 * Chapter on the left, card or practice on the right. Below 1024px an open
 * card or practice session covers the screen; Fechar returns to the chapter.
 */
export function BookShell({
  header,
  children,
  fallback,
  lessonTitle,
  renderLesson,
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
  /** Shown in the dock when nothing else is open (the old mastery panel). */
  fallback?: React.ReactNode;
  /** Chapter title used in the practice header. */
  lessonTitle?: string;
  /** Full lesson player, mounted only while `praticar=1` and the reader is signed in. */
  renderLesson?: (args: { onDismiss: () => void }) => React.ReactNode;
}) {
  return (
    <Suspense fallback={<PageShell header={header}><div className="py-16 text-[13px] text-[#5A5A57]">A abrir o capítulo…</div></PageShell>}>
      <BookProvider>
        <Shell header={header} fallback={fallback} lessonTitle={lessonTitle} renderLesson={renderLesson}>
          {children}
        </Shell>
      </BookProvider>
    </Suspense>
  );
}

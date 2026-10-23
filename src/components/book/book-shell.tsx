"use client";

import { Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PageShell } from "@/components/layout/page-shell";
import { BookProvider, useBook } from "./book-context";
import { CardPane } from "./card-pane";
import { PracticePane } from "./practice-pane";

type BookMode = "cover" | "sheet" | "dock";

function useBookFrame() {
  const [frame, setFrame] = useState<{ mode: BookMode; tight: boolean }>({ mode: "dock", tight: false });
  useEffect(() => {
    const cover = window.matchMedia("(max-width: 743px)");
    const dock = window.matchMedia("(min-width: 1024px)");
    const tight = window.matchMedia("(max-width: 1279px)");
    const apply = () => {
      const mode: BookMode = cover.matches ? "cover" : dock.matches ? "dock" : "sheet";
      setFrame({ mode, tight: tight.matches });
    };
    apply();
    cover.addEventListener("change", apply);
    dock.addEventListener("change", apply);
    tight.addEventListener("change", apply);
    return () => {
      cover.removeEventListener("change", apply);
      dock.removeEventListener("change", apply);
      tight.removeEventListener("change", apply);
    };
  }, []);
  return frame;
}

/** Right-hand sheet over the chapter. The chapter stays underneath and in the URL. */
function DockSheet({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return createPortal(
    <div className="fixed inset-y-0 right-0 left-0 z-[60] flex justify-end p-2 pt-[max(0.5rem,env(safe-area-inset-top))] pr-[max(0.5rem,env(safe-area-inset-right))] pb-[max(0.5rem,env(safe-area-inset-bottom))] min-[768px]:left-[calc(60px+env(safe-area-inset-left))]">
      <button type="button" aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-[#1B2B61]/10" />
      <div className="animate-slide-in-right relative flex h-full min-h-0 w-[min(440px,100%)] min-w-0 flex-col overflow-hidden rounded-xl border border-aula-line bg-white shadow-[0_16px_40px_rgba(27,43,97,0.14)]">
        {children}
      </div>
    </div>,
    document.body,
  );
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
  const frame = useBookFrame();
  const wide = frame.mode === "dock";
  const practicing = Boolean(book.practice);
  const open = Boolean(book.current || practicing);
  const dock = practicing && wide ? (
    <div className="flex min-h-0 flex-1 flex-col">
      <PracticePane lessonTitle={lessonTitle} renderLesson={renderLesson} />
    </div>
  ) : book.current && wide ? (
    <div className="flex min-h-0 flex-1 flex-col">
      <CardPane />
    </div>
  ) : !book.current && !practicing && fallback ? (
    <div className="aula-pane min-h-0 flex-1 overflow-y-auto p-4">{fallback}</div>
  ) : null;

  const cover = "fixed inset-0 z-[60] flex min-h-0 flex-col bg-white lg:hidden";
  const forceRail = frame.tight && frame.mode !== "cover" && (frame.mode === "sheet" ? open : Boolean(dock));
  const closeOverlay = () => {
    if (practicing) book.closePractice();
    else if (book.current) book.close(book.index);
  };

  return (
    <PageShell
      header={header}
      dock={wide ? dock : null}
      wideDock={practicing && wide}
      forceRail={forceRail}
      snug={wide && frame.tight && Boolean(dock)}
    >
      {children}
      {frame.mode === "cover" &&
        practicing &&
        createPortal(
          <div className={cover}>
            <PracticePane lessonTitle={lessonTitle} renderLesson={renderLesson} />
          </div>,
          document.body,
        )}
      {frame.mode === "cover" &&
        !practicing &&
        book.current &&
        createPortal(
          <div className={cover}>
            <CardPane />
          </div>,
          document.body,
        )}
      {frame.mode === "sheet" && open && (
        <DockSheet onClose={closeOverlay}>
          {practicing ? (
            <PracticePane lessonTitle={lessonTitle} renderLesson={renderLesson} />
          ) : (
            <CardPane />
          )}
        </DockSheet>
      )}
    </PageShell>
  );
}

/**
 * Chapter on the left, card or practice on the right.
 * Below 744px an open card covers the screen. From 744px to 1023px it opens
 * as a sheet over the chapter. From 1024px the two panes sit side by side.
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

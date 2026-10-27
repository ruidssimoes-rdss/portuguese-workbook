"use client";

/**
 * Where Elísio sits. From 1024px it takes the right slot (in place of the book dock or the info panel).
 * 744 to 1023px: a right sheet over the page. Below 744px: a full-screen cover.
 */

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useElisio } from "./elisio-provider";

const ElisioRail = dynamic(() => import("./elisio-rail").then((m) => m.ElisioRail), {
  ssr: false,
  loading: () => <p className="p-4 text-[13px] text-aula-text-2">A preparar…</p>,
});

export type ElisioFrame = { mode: "cover" | "sheet" | "dock"; tight: boolean };

export function useElisioFrame(): ElisioFrame {
  const [frame, setFrame] = useState<ElisioFrame>({ mode: "dock", tight: false });
  useEffect(() => {
    const cover = window.matchMedia("(max-width: 743px)");
    const dock = window.matchMedia("(min-width: 1024px)");
    const tight = window.matchMedia("(max-width: 1279px)");
    const apply = () => setFrame({ mode: cover.matches ? "cover" : dock.matches ? "dock" : "sheet", tight: tight.matches });
    const frameId = requestAnimationFrame(apply);
    cover.addEventListener("change", apply);
    dock.addEventListener("change", apply);
    tight.addEventListener("change", apply);
    return () => {
      cancelAnimationFrame(frameId);
      cover.removeEventListener("change", apply);
      dock.removeEventListener("change", apply);
      tight.removeEventListener("change", apply);
    };
  }, []);
  return frame;
}

/** The right-slot aside, from 1024px. */
export function ElisioAside() {
  return (
    <aside className="aula-rail hidden min-h-0 shrink-0 flex-col overflow-hidden rounded-xl border border-aula-line bg-aula-panel p-0 lg:flex">
      <ElisioRail />
    </aside>
  );
}

/** Below 1024px: the sheet or the cover, through a portal. */
export function ElisioOverlay({ frame }: { frame: ElisioFrame }) {
  const elisio = useElisio();
  if (!elisio.open || frame.mode === "dock") return null;
  if (frame.mode === "cover") {
    return createPortal(<div className="fixed inset-0 z-[70] flex h-dvh min-h-0 flex-col bg-white">{<ElisioRail />}</div>, document.body);
  }
  return createPortal(
    <div className="fixed inset-y-0 right-0 left-0 z-[70] flex justify-end p-2 pt-[max(0.5rem,env(safe-area-inset-top))] pr-[max(0.5rem,env(safe-area-inset-right))] pb-[max(0.5rem,env(safe-area-inset-bottom))] min-[768px]:left-[calc(60px+env(safe-area-inset-left))]">
      <button type="button" aria-label="Fechar" onClick={elisio.closeElisio} className="absolute inset-0 bg-[#1B2B61]/10" />
      <div className="animate-slide-in-right relative flex h-full min-h-0 w-[min(440px,100%)] min-w-0 flex-col overflow-hidden rounded-xl border border-aula-line bg-white shadow-[0_16px_40px_rgba(27,43,97,0.14)]">
        <ElisioRail />
      </div>
    </div>,
    document.body,
  );
}

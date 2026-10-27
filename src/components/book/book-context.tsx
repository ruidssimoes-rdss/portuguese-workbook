"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useElisio } from "@/components/elisio/elisio-provider";
import {
  decodeCard,
  decodePractice,
  encodeCard,
  encodePractice,
  FICHA_PARAM,
  PRATICAR_PARAM,
  sameCard,
  type CardRef,
  type PracticeTarget,
} from "@/lib/book/types";

type State = { tabs: CardRef[]; index: number };

type Action =
  | { type: "open"; ref: CardRef }
  | { type: "back" }
  | { type: "forward" }
  | { type: "close"; index: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "open": {
      const existing = state.tabs.findIndex((tab) => sameCard(tab, action.ref));
      if (existing >= 0) return { ...state, index: existing };
      const tabs = [...state.tabs.slice(0, state.index + 1), action.ref];
      return { tabs, index: tabs.length - 1 };
    }
    case "back":
      return state.index > 0 ? { ...state, index: state.index - 1 } : state;
    case "forward":
      return state.index < state.tabs.length - 1 ? { ...state, index: state.index + 1 } : state;
    case "close": {
      const tabs = state.tabs.filter((_, i) => i !== action.index);
      if (tabs.length === 0) return { tabs, index: 0 };
      let index = state.index;
      if (action.index < state.index) index -= 1;
      else if (action.index === state.index) index = Math.min(index, tabs.length - 1);
      return { tabs, index };
    }
  }
}

export interface BookApi {
  tabs: CardRef[];
  index: number;
  current: CardRef | null;
  canBack: boolean;
  canForward: boolean;
  practice: PracticeTarget | null;
  openCard: (ref: CardRef) => void;
  back: () => void;
  forward: () => void;
  close: (index: number) => void;
  openPractice: (target: PracticeTarget) => void;
  closePractice: () => void;
}

const BookContext = createContext<BookApi | null>(null);

export function BookProvider({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  const decoded = decodeCard(params.get(FICHA_PARAM));
  // Old ficha=elisio:… links open Elísio in the rail instead of a card tab.
  const [askAbout] = useState(() => (decoded?.kind === "elisio" ? decoded.about : null));
  const initialCard = decoded?.kind === "elisio" ? null : decoded;
  const initialPractice = decodePractice(params.get(PRATICAR_PARAM));
  const { openElisio } = useElisio();
  const seedCard = initialCard ?? (initialPractice && initialPractice.kind !== "lesson" ? initialPractice : null);
  const [state, dispatch] = useReducer(reducer, {
    tabs: seedCard ? [seedCard] : [],
    index: 0,
  });
  const [practice, setPractice] = useState<PracticeTarget | null>(initialPractice);
  const current = state.tabs[state.index] ?? null;

  useEffect(() => {
    if (askAbout) openElisio(askAbout);
  }, [askAbout, openElisio]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const ficha = current ? encodeCard(current) : null;
    const pratica = practice ? encodePractice(practice) : null;
    const curFicha = url.searchParams.get(FICHA_PARAM);
    const curPratica = url.searchParams.get(PRATICAR_PARAM);
    if ((ficha ?? null) === curFicha && (pratica ?? null) === curPratica) return;
    if (ficha) url.searchParams.set(FICHA_PARAM, ficha);
    else url.searchParams.delete(FICHA_PARAM);
    if (pratica) url.searchParams.set(PRATICAR_PARAM, pratica);
    else url.searchParams.delete(PRATICAR_PARAM);
    const search = url.searchParams.toString();
    window.history.replaceState(window.history.state, "", `${url.pathname}${search ? `?${search}` : ""}${url.hash}`);
  }, [current, practice]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (practice) {
        setPractice(null);
        return;
      }
      if (!current) return;
      dispatch({ type: "close", index: state.index });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [practice, current, state.index]);

  const api = useMemo<BookApi>(
    () => ({
      tabs: state.tabs,
      index: state.index,
      current,
      canBack: state.index > 0,
      canForward: state.index < state.tabs.length - 1,
      practice,
      openCard: (ref) => dispatch({ type: "open", ref }),
      back: () => dispatch({ type: "back" }),
      forward: () => dispatch({ type: "forward" }),
      close: (index) => dispatch({ type: "close", index }),
      openPractice: (target) => {
        setPractice((cur) => (cur && encodePractice(cur) === encodePractice(target) ? cur : target));
        if (target.kind !== "lesson") dispatch({ type: "open", ref: target });
      },
      closePractice: () => setPractice(null),
    }),
    [state.tabs, state.index, current, practice],
  );

  return <BookContext.Provider value={api}>{children}</BookContext.Provider>;
}

export function useBook(): BookApi {
  const ctx = useContext(BookContext);
  if (!ctx) throw new Error("useBook must be used inside BookProvider");
  return ctx;
}

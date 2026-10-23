"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { useSearchParams } from "next/navigation";
import { decodeCard, encodeCard, FICHA_PARAM, sameCard, type CardRef } from "@/lib/book/types";

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
  openCard: (ref: CardRef) => void;
  back: () => void;
  forward: () => void;
  close: (index: number) => void;
}

const BookContext = createContext<BookApi | null>(null);

export function BookProvider({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  const initial = decodeCard(params.get(FICHA_PARAM));
  const [state, dispatch] = useReducer(reducer, {
    tabs: initial ? [initial] : [],
    index: 0,
  });
  const current = state.tabs[state.index] ?? null;

  useEffect(() => {
    const url = new URL(window.location.href);
    const next = current ? encodeCard(current) : null;
    const cur = url.searchParams.get(FICHA_PARAM);
    if ((next ?? null) === cur) return;
    if (next) url.searchParams.set(FICHA_PARAM, next);
    else url.searchParams.delete(FICHA_PARAM);
    const search = url.searchParams.toString();
    window.history.replaceState(window.history.state, "", `${url.pathname}${search ? `?${search}` : ""}${url.hash}`);
  }, [current]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape" || !current) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      dispatch({ type: "close", index: state.index });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, state.index]);

  const api = useMemo<BookApi>(
    () => ({
      tabs: state.tabs,
      index: state.index,
      current,
      canBack: state.index > 0,
      canForward: state.index < state.tabs.length - 1,
      openCard: (ref) => dispatch({ type: "open", ref }),
      back: () => dispatch({ type: "back" }),
      forward: () => dispatch({ type: "forward" }),
      close: (index) => dispatch({ type: "close", index }),
    }),
    [state.tabs, state.index, current],
  );

  return <BookContext.Provider value={api}>{children}</BookContext.Provider>;
}

export function useBook(): BookApi {
  const ctx = useContext(BookContext);
  if (!ctx) throw new Error("useBook must be used inside BookProvider");
  return ctx;
}

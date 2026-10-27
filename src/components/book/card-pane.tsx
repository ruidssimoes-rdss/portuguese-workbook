"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AudioSpeedControl } from "@/components/audio-speed-control";
import { encodeCard } from "@/lib/book/types";
import { useBook } from "./book-context";
import { CardBody, cardCrumb, cardTabLabel } from "./cards";

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="tablet-target-sq inline-flex h-7 w-7 items-center justify-center rounded-md text-aula-text transition-colors hover:bg-aula-sunken disabled:opacity-30"
    >
      {children}
    </button>
  );
}

/** Right-hand card: tab stack, back/forward, and the open ficha. */
export function CardPane() {
  const book = useBook();
  const current = book.current;
  if (!current) return null;
  const crumb = cardCrumb(current);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-1 overflow-x-auto px-2 pt-2">
        {book.tabs.map((tab, i) => {
          const on = i === book.index;
          return (
            <div
              key={`${i}-${cardTabLabel(tab)}`}
              className={`tablet-target flex h-7 max-w-[168px] shrink-0 items-center rounded-lg pl-2 pr-1 text-[12px] ${
                on ? "border border-aula-line bg-white font-medium text-aula-text" : "text-[#5A5A57] hover:bg-aula-sunken"
              }`}
            >
              <button type="button" onClick={() => book.openCard(tab)} className="tap-44 min-w-0 truncate">
                {cardTabLabel(tab)}
              </button>
              <button
                type="button"
                aria-label={`Fechar ${cardTabLabel(tab)}`}
                onClick={() => book.close(i)}
                className="tap-44 ml-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[#5A5A57] hover:text-aula-text"
              >
                <X size={12} strokeWidth={1.7} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex min-h-10 shrink-0 flex-wrap items-center gap-1 px-pad py-1 text-[12px]">
        <IconButton label="Ficha anterior" disabled={!book.canBack} onClick={book.back}>
          <ChevronLeft size={16} strokeWidth={1.7} />
        </IconButton>
        <IconButton label="Ficha seguinte" disabled={!book.canForward} onClick={book.forward}>
          <ChevronRight size={16} strokeWidth={1.7} />
        </IconButton>
        <span className="min-w-0 truncate pl-1 text-[#5A5A57]">{crumb.group}</span>
        <span className="text-[#B5B5AE]">/</span>
        <span className="min-w-0 truncate font-medium text-aula-text">{crumb.name}</span>
        <span className="flex-1" />
        <AudioSpeedControl />
        <button
          type="button"
          onClick={() => book.close(book.index)}
          className={`tablet-target inline-flex h-7 items-center rounded-md px-2 text-[12px] font-medium text-[#5A5A57] hover:bg-aula-sunken hover:text-aula-text lg:hidden`}
        >
          Fechar
        </button>
      </div>

      <div className="aula-pane min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-pad pb-pad pt-heading">
        <CardBody key={encodeCard(current)} card={current} />
      </div>
    </div>
  );
}

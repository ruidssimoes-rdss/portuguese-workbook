"use client";

import { AudioButton } from "@/components/primitives";

interface VocabLearnCardProps {
  word: string;
  translation: string;
  pronunciation?: string;
  example?: { pt: string; en: string };
}

/** Learn phase · new word (matches the Vocabulário word note). */
export function VocabLearnCard({ word, translation, pronunciation, example }: VocabLearnCardProps) {
  return (
    <div className="rounded-xl border border-aula-border bg-white p-6">
      <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3">Palavra nova</p>
      <div className="flex items-center gap-2">
        <h2 className="text-[26px] font-semibold tracking-[-0.02em] text-aula-text">{word}</h2>
        <AudioButton text={word} />
      </div>
      {pronunciation && <p className="mt-0.5 text-[12.5px] text-aula-text-3">/{pronunciation.replace(/^\/|\/$/g, "")}/</p>}
      <p className="mt-3 text-[15px] text-aula-text-2">{translation}</p>
      {example && (
        <div className="mt-5 flex gap-2.5 rounded-[10px] bg-aula-sunken px-4 py-3">
          <AudioButton text={example.pt} />
          <div>
            <p className="text-[14px] font-medium text-aula-text">{example.pt}</p>
            <p className="mt-0.5 text-[12px] text-aula-text-3">{example.en}</p>
          </div>
        </div>
      )}
    </div>
  );
}

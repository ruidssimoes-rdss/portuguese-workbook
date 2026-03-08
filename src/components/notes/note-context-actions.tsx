"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getNoteCountForContext } from "@/lib/notes-service";

interface NoteContextActionsProps {
  contextType: "grammar" | "vocabulary" | "verb" | "lesson";
  contextId: string;
  contextLabel: string;
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

export function NoteContextActions({ contextType, contextId, contextLabel }: NoteContextActionsProps) {
  const router = useRouter();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    getNoteCountForContext(contextType, contextId).then(setCount);
  }, [contextType, contextId]);

  const handleAddNote = () => {
    const params = new URLSearchParams({
      contextType,
      contextId,
      contextLabel,
    });
    router.push(`/notes?${params.toString()}`);
  };

  const handleViewNotes = () => {
    router.push(`/notes?contextType=${contextType}&contextId=${contextId}`);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleAddNote}
        className="flex items-center gap-1.5 text-[13px] font-medium text-[#6B7280] hover:text-[#003399] transition-colors duration-200"
      >
        <PencilIcon className="w-4 h-4" />
        Adicionar nota
      </button>
      {count !== null && count > 0 && (
        <button
          type="button"
          onClick={handleViewNotes}
          className="text-[12px] font-medium text-[#9CA3AF] hover:text-[#003399] transition-colors duration-200"
        >
          {count === 1 ? "1 nota" : `${count} notas`}
        </button>
      )}
    </div>
  );
}

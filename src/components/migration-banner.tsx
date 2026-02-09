"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  hasLocalProgress,
  getLocalProgress,
  migrateLocalToSupabase,
} from "@/lib/progress-service";

const SECTION_LABELS: Record<string, string> = {
  conjugations: "Conjugações",
  vocabulary: "Vocabulário",
  grammar: "Gramática",
};

export function MigrationBanner({
  onMigrationComplete,
}: {
  onMigrationComplete?: () => void;
}) {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const show =
    !!user &&
    hasLocalProgress() &&
    !dismissed &&
    !success;

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(false), 3000);
    return () => clearTimeout(t);
  }, [success]);

  const local = show ? getLocalProgress() : null;
  const previewLines: string[] = [];
  if (local) {
    if (
      local.conjugations.currentLevel !== "A1.1" ||
      local.conjugations.totalTestsTaken > 0
    ) {
      previewLines.push(
        `${SECTION_LABELS.conjugations}: nível ${local.conjugations.currentLevel} · ${local.conjugations.totalTestsTaken} testes`
      );
    }
    if (
      local.vocabulary.currentLevel !== "A1.1" ||
      local.vocabulary.totalTestsTaken > 0
    ) {
      previewLines.push(
        `${SECTION_LABELS.vocabulary}: nível ${local.vocabulary.currentLevel} · ${local.vocabulary.totalTestsTaken} testes`
      );
    }
    if (
      local.grammar.currentLevel !== "A1.1" ||
      local.grammar.totalTestsTaken > 0
    ) {
      previewLines.push(
        `${SECTION_LABELS.grammar}: nível ${local.grammar.currentLevel} · ${local.grammar.totalTestsTaken} testes`
      );
    }
  }

  const handleMigrate = async () => {
    if (!user?.id) return;
    setError(null);
    setMigrating(true);
    const result = await migrateLocalToSupabase(user.id);
    setMigrating(false);
    if (result.success) {
      setSuccess(true);
      onMigrationComplete?.();
    } else {
      setError(result.error ?? "Ocorreu um erro.");
    }
  };

  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-3 mb-6 text-green-800 text-[14px]">
        Dados transferidos com sucesso.
      </div>
    );
  }

  if (!show) return null;

  return (
    <div className="rounded-lg border border-[#5B4FA0]/20 bg-[#F0F5FF] p-4 mb-6">
      <div className="flex gap-3">
        <div className="shrink-0 mt-0.5">
          <svg
            className="w-5 h-5 text-[#5B4FA0]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-[#5B4FA0] text-[15px]">
            Dados de progresso encontrados
          </h2>
          <p className="text-[14px] text-text-2 mt-1">
            Encontrámos progresso guardado neste dispositivo. Queres transferi-lo
            para a tua conta?
          </p>
          {previewLines.length > 0 && (
            <ul className="mt-2 text-[13px] text-text-2 list-disc list-inside space-y-0.5">
              {previewLines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          )}
          {error && (
            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm">
              {error}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleMigrate}
              disabled={migrating}
              className="rounded-lg bg-[#5B4FA0] px-4 py-2 text-white text-[14px] font-medium hover:bg-[#4a4190] disabled:opacity-60 flex items-center gap-2"
            >
              {migrating ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  A transferir...
                </>
              ) : (
                "Transferir dados"
              )}
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="rounded-lg bg-transparent text-[#5B4FA0] text-[14px] font-medium hover:underline"
            >
              Ignorar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

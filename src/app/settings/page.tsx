"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";
import { useTheme } from "@/components/theme-provider";
import { createClient } from "@/lib/supabase/client";
import { PageContainer } from "@/components/ui/page-container";
import { Button } from "@/components/ui/button";
import {
  getOnboardingData,
  saveOnboardingData,
  type OnboardingData,
} from "@/lib/onboarding-service";
import { getActiveGoals } from "@/lib/goals-service";
import { exportUserData } from "@/lib/export-user-data";
import type { Profile, UserSettings } from "@/types/database";

const SPEED_OPTIONS = [
  { value: 0.6, label: "Lento" },
  { value: 0.85, label: "Normal" },
  { value: 1, label: "Rápido" },
];

const DAILY_GOAL_OPTIONS = [5, 10, 15, 20];

const MOTIVATION_OPTIONS = [
  { value: "moving-to-portugal", label: "Vou mudar-me para Portugal" },
  { value: "family", label: "Família / parceiro(a) português(a)" },
  { value: "travel", label: "Viagens e férias" },
  { value: "work", label: "Trabalho / negócios" },
  { value: "cultural-interest", label: "Interesse cultural" },
  { value: "ciple-exam", label: "Preparação para o exame CIPLE" },
  { value: "curious", label: "Apenas curiosidade" },
];

const LEVEL_OPTIONS = [
  { value: "complete-beginner", label: "Iniciante total — não sei nada" },
  { value: "some-basics", label: "Sei algumas coisas básicas — cumprimentos, frases simples" },
  { value: "basic-conversations", label: "Consigo ter conversas básicas" },
  { value: "intermediate-gaps", label: "Sou intermédio mas tenho lacunas" },
];

const STUDY_DAYS_OPTIONS = [
  { value: 2, label: "2 dias por semana" },
  { value: 3, label: "3 dias por semana" },
  { value: 4, label: "4 dias por semana" },
  { value: 5, label: "5 dias por semana" },
  { value: 6, label: "6 dias por semana" },
  { value: 7, label: "Todos os dias" },
];

const TARGET_GOAL_OPTIONS = [
  { value: "no-goal", label: "Sem objetivo específico — estou a explorar" },
  { value: "reach-a2", label: "Alcançar o nível A2" },
  { value: "reach-b1", label: "Alcançar o nível B1" },
  { value: "pass-ciple-a2", label: "Passar o exame CIPLE A2" },
  { value: "pass-ciple-b1", label: "Passar o exame CIPLE B1" },
  { value: "conversational", label: "Ser capaz de conversar" },
];

const PREFERRED_STUDY_TIME_OPTIONS = [
  { value: "morning", label: "Manhã" },
  { value: "afternoon", label: "Tarde" },
  { value: "evening", label: "Noite" },
];

function formatTargetDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}

function Section({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-4">
        {title}
      </h2>
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-[12px] divide-y divide-[var(--border-light)]">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({
  label,
  description,
  children,
}: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <p className="text-[14px] font-medium text-[var(--text-primary)]">{label}</p>
        {description && (
          <p className="text-[12px] text-[var(--text-muted)]">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [activeGoalsCount, setActiveGoalsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [savedField, setSavedField] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showGoalRecalcPrompt, setShowGoalRecalcPrompt] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [exporting, setExporting] = useState(false);
  const prevOnboardingRef = useRef<{ studyDaysPerWeek: number; targetGoal: string } | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [pronunciationSpeed, setPronunciationSpeed] = useState(0.85);
  const [showPhonetics, setShowPhonetics] = useState(true);
  const [dailyGoal, setDailyGoal] = useState(10);
  const [showTranslations, setShowTranslations] = useState(true);
  const [preferredStudyTime, setPreferredStudyTime] = useState("evening");

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    const supabase = createClient();
    const [profileRes, settingsRes, onboardingData, goals] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("user_settings").select("*").eq("user_id", user.id).single(),
      getOnboardingData(),
      getActiveGoals(),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data as Profile);
      setDisplayName(profileRes.data.display_name ?? "");
    }
    if (settingsRes.data) {
      const s = settingsRes.data as UserSettings;
      setSettings(s);
      setPronunciationSpeed(s.pronunciation_speed ?? 0.85);
      setShowPhonetics(s.show_phonetics ?? true);
      setDailyGoal(s.daily_goal ?? 10);
      setShowTranslations(s.show_translations ?? true);
      setPreferredStudyTime(s.preferred_study_time ?? "evening");
    } else if (!settingsRes.error || settingsRes.error.code !== "PGRST116") {
      setPronunciationSpeed(0.85);
      setShowPhonetics(true);
      setDailyGoal(10);
      setShowTranslations(true);
      setPreferredStudyTime("evening");
    }
    if (onboardingData) {
      setOnboarding(onboardingData);
      prevOnboardingRef.current = {
        studyDaysPerWeek: onboardingData.studyDaysPerWeek,
        targetGoal: onboardingData.targetGoal,
      };
    } else {
      setOnboarding(null);
      prevOnboardingRef.current = null;
    }
    setActiveGoalsCount(goals.length);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showSaved = useCallback((field: string) => {
    setSavedField(field);
    setTimeout(() => setSavedField(null), 2000);
  }, []);

  const saveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "ok", text: "Perfil guardado." });
    }
  };

  const saveOnboardingField = async (data: Partial<OnboardingData>) => {
    if (!onboarding) return;
    setSaving(true);
    setMessage(null);
    const full: OnboardingData = {
      ...onboarding,
      ...data,
    };
    const ok = await saveOnboardingData(full);
    setSaving(false);
    if (ok) {
      setOnboarding(full);
      setEditingField(null);
      showSaved("onboarding");
      const prev = prevOnboardingRef.current;
      if (
        prev &&
        activeGoalsCount > 0 &&
        ((data.studyDaysPerWeek !== undefined && data.studyDaysPerWeek !== prev.studyDaysPerWeek) ||
          (data.targetGoal !== undefined && data.targetGoal !== prev.targetGoal))
      ) {
        setShowGoalRecalcPrompt(true);
      }
      if (data.studyDaysPerWeek !== undefined || data.targetGoal !== undefined) {
        prevOnboardingRef.current = {
          studyDaysPerWeek: full.studyDaysPerWeek,
          targetGoal: full.targetGoal,
        };
      }
    } else {
      setMessage({ type: "error", text: "Erro ao guardar." });
    }
  };

  const saveSettings = async () => {
    if (!user?.id) return;
    setSaving(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: user.id,
          pronunciation_speed: pronunciationSpeed,
          show_phonetics: showPhonetics,
          daily_goal: dailyGoal,
          show_translations: showTranslations,
          preferred_study_time: preferredStudyTime,
          theme: theme,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    setSaving(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "ok", text: "Definições guardadas." });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportUserData();
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmText.trim().toUpperCase() !== "APAGAR") return;
    setShowDeleteConfirm(false);
    setDeleteConfirmText("");
    window.location.href =
      "mailto:support@aula-pt.com?subject=Apagar%20conta&body=Por%20favor%2C%20solicito%20a%20elimina%C3%A7%C3%A3o%20da%20minha%20conta%20e%20dos%20meus%20dados.";
  };

  const motivationLabel = MOTIVATION_OPTIONS.find((o) => o.value === onboarding?.learningMotivation)?.label ?? "—";
  const levelLabel = LEVEL_OPTIONS.find((o) => o.value === onboarding?.selfAssessedLevel)?.label ?? "—";
  const studyDaysLabel = STUDY_DAYS_OPTIONS.find((o) => o.value === onboarding?.studyDaysPerWeek)?.label ?? "—";
  const targetGoalLabel = TARGET_GOAL_OPTIONS.find((o) => o.value === onboarding?.targetGoal)?.label ?? "—";
  const onboardingComplete = profile?.onboarding_completed === true && onboarding?.learningMotivation;

  if (loading) {
    return (
      <>
        <Topbar />
        <ProtectedRoute>
          <PageContainer width="xnarrow" className="py-12">
            <p className="text-[var(--text-secondary)]">A carregar...</p>
          </PageContainer>
        </ProtectedRoute>
      </>
    );
  }

  return (
    <>
      <Topbar />
      <ProtectedRoute>
        <PageContainer width="xnarrow" className="py-12 space-y-8">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Definições
          </h1>

          {message && (
            <div
              className={`rounded-lg border p-3 text-sm ${
                message.type === "ok"
                  ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-200"
                  : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Learning profile */}
          <Section title="O teu perfil de aprendizagem">
            {onboardingComplete ? (
              <>
                <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-[var(--text-muted)]">Motivação</p>
                    {editingField === "motivation" ? (
                      <select
                        autoFocus
                        value={onboarding?.learningMotivation ?? ""}
                        onChange={(e) =>
                          saveOnboardingField({ learningMotivation: e.target.value })
                        }
                        onBlur={() => setEditingField(null)}
                        className="mt-1 w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-[14px] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--brand)] outline-none"
                      >
                        {MOTIVATION_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-[14px] font-medium text-[var(--text-primary)] mt-0.5">
                        {motivationLabel}
                        {savedField === "onboarding" && (
                          <span className="ml-2 text-[12px] text-green-600 dark:text-green-400">
                            Guardado
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingField((f) => (f === "motivation" ? null : "motivation"))}
                    className="shrink-0 p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--border-light)] hover:text-[var(--text-primary)]"
                    aria-label="Editar motivação"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </div>
                <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-[var(--text-muted)]">Nível atual</p>
                    {editingField === "level" ? (
                      <select
                        autoFocus
                        value={onboarding?.selfAssessedLevel ?? ""}
                        onChange={(e) =>
                          saveOnboardingField({ selfAssessedLevel: e.target.value })
                        }
                        onBlur={() => setEditingField(null)}
                        className="mt-1 w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-[14px] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--brand)] outline-none"
                      >
                        {LEVEL_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-[14px] font-medium text-[var(--text-primary)] mt-0.5">
                        {levelLabel}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingField((f) => (f === "level" ? null : "level"))}
                    className="shrink-0 p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--border-light)] hover:text-[var(--text-primary)]"
                    aria-label="Editar nível"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </div>
                <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-[var(--text-muted)]">Dias de estudo</p>
                    {editingField === "studyDays" ? (
                      <select
                        autoFocus
                        value={onboarding?.studyDaysPerWeek ?? 3}
                        onChange={(e) =>
                          saveOnboardingField({
                            studyDaysPerWeek: Number(e.target.value),
                          })
                        }
                        onBlur={() => setEditingField(null)}
                        className="mt-1 w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-[14px] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--brand)] outline-none"
                      >
                        {STUDY_DAYS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-[14px] font-medium text-[var(--text-primary)] mt-0.5">
                        {studyDaysLabel}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingField((f) => (f === "studyDays" ? null : "studyDays"))}
                    className="shrink-0 p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--border-light)] hover:text-[var(--text-primary)]"
                    aria-label="Editar dias de estudo"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </div>
                <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-[var(--text-muted)]">Objetivo</p>
                    {editingField === "targetGoal" ? (
                      <select
                        autoFocus
                        value={onboarding?.targetGoal ?? ""}
                        onChange={(e) =>
                          saveOnboardingField({ targetGoal: e.target.value })
                        }
                        onBlur={() => setEditingField(null)}
                        className="mt-1 w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-[14px] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--brand)] outline-none"
                      >
                        {TARGET_GOAL_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-[14px] font-medium text-[var(--text-primary)] mt-0.5">
                        {targetGoalLabel}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingField((f) => (f === "targetGoal" ? null : "targetGoal"))}
                    className="shrink-0 p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--border-light)] hover:text-[var(--text-primary)]"
                    aria-label="Editar objetivo"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </div>
                <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-[var(--text-muted)]">Data alvo</p>
                    {editingField === "targetDate" ? (
                      <input
                        type="date"
                        autoFocus
                        value={onboarding?.targetDate ?? ""}
                        onChange={(e) =>
                          saveOnboardingField({ targetDate: e.target.value || undefined })
                        }
                        onBlur={() => setEditingField(null)}
                        className="mt-1 w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-[14px] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--brand)] outline-none"
                      />
                    ) : (
                      <p className="text-[14px] font-medium text-[var(--text-primary)] mt-0.5">
                        {formatTargetDate(onboarding?.targetDate)}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingField((f) => (f === "targetDate" ? null : "targetDate"))}
                    className="shrink-0 p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--border-light)] hover:text-[var(--text-primary)]"
                    aria-label="Editar data alvo"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </div>
                {showGoalRecalcPrompt && (
                  <div className="px-5 py-4 bg-[var(--brand-light)] border-t border-[var(--border-light)] rounded-b-[12px]">
                    <p className="text-[13px] text-[var(--text-primary)] mb-2">
                      As tuas preferências mudaram. Queres atualizar o teu plano de estudo?
                    </p>
                    <Link
                      href="/calendar"
                      className="text-[14px] font-medium text-[var(--brand)] hover:underline"
                    >
                      Ir para objetivos no calendário
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="px-5 py-4">
                <p className="text-[14px] text-[var(--text-secondary)] mb-3">
                  Não fizeste a configuração inicial?
                </p>
                <Link
                  href="/onboarding"
                  className="text-[14px] font-medium text-[var(--brand)] hover:underline"
                >
                  Configurar agora
                </Link>
              </div>
            )}
          </Section>

          {/* Appearance */}
          <Section title="Aparência">
            <SettingsRow
              label="Modo escuro"
              description="Ajustar a aparência da aplicação"
            >
              <div className="flex bg-[var(--border-light)] rounded-[10px] p-0.5">
                {(["light", "dark", "system"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTheme(mode)}
                    className={`px-3 py-1.5 text-[12px] font-medium rounded-[8px] transition-all ${
                      theme === mode
                        ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {mode === "light" ? "Claro" : mode === "dark" ? "Escuro" : "Sistema"}
                  </button>
                ))}
              </div>
            </SettingsRow>
          </Section>

          {/* Learning preferences */}
          <Section title="Preferências de aprendizagem">
            <SettingsRow
              label="Velocidade da pronúncia"
              description="Lento, normal ou rápido"
            >
              <select
                value={pronunciationSpeed}
                onChange={(e) => setPronunciationSpeed(Number(e.target.value))}
                className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-[13px] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--brand)] outline-none"
              >
                {SPEED_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </SettingsRow>
            <SettingsRow
              label="Mostrar fonética"
              description="Transcrição fonética nas palavras"
            >
              <button
                type="button"
                role="switch"
                aria-checked={showPhonetics}
                onClick={() => setShowPhonetics((v) => !v)}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] ${
                  showPhonetics ? "bg-[var(--brand)] border-[var(--brand)]" : "bg-[var(--border-light)] border-[var(--border-primary)]"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    showPhonetics ? "translate-x-5" : "translate-x-0.5"
                  }`}
                  style={{ marginTop: 2 }}
                />
              </button>
            </SettingsRow>
            <SettingsRow
              label="Objetivo diário (palavras)"
              description="Palavras por dia no vocabulário"
            >
              <select
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-[13px] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--brand)] outline-none"
              >
                {DAILY_GOAL_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </SettingsRow>
            <SettingsRow
              label="Mostrar traduções em inglês"
              description="Esconde as traduções para uma experiência mais imersiva."
            >
              <button
                type="button"
                role="switch"
                aria-checked={showTranslations}
                onClick={() => setShowTranslations((v) => !v)}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] ${
                  showTranslations ? "bg-[var(--brand)] border-[var(--brand)]" : "bg-[var(--border-light)] border-[var(--border-primary)]"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    showTranslations ? "translate-x-5" : "translate-x-0.5"
                  }`}
                  style={{ marginTop: 2 }}
                />
              </button>
            </SettingsRow>
            <SettingsRow
              label="Melhor hora para estudar"
              description="Para futuras notificações e lembretes."
            >
              <select
                value={preferredStudyTime}
                onChange={(e) => setPreferredStudyTime(e.target.value)}
                className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-[13px] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--brand)] outline-none"
              >
                {PREFERRED_STUDY_TIME_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </SettingsRow>
            <div className="px-5 py-4">
              <Button variant="primary" onClick={saveSettings} disabled={saving}>
                {saving ? "A guardar..." : "Guardar preferências"}
              </Button>
            </div>
          </Section>

          {/* Account */}
          <Section title="Conta">
            <SettingsRow label="Nome">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-[180px] rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-[14px] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--brand)] outline-none"
              />
            </SettingsRow>
            <SettingsRow label="Email">
              <p className="text-[14px] text-[var(--text-secondary)]">{user?.email ?? "—"}</p>
            </SettingsRow>
            <div className="px-5 py-4 flex flex-wrap items-center gap-3">
              <Button variant="primary" onClick={saveProfile} disabled={saving}>
                {saving ? "A guardar..." : "Guardar perfil"}
              </Button>
              <Link
                href="/auth/update-password"
                className="text-[14px] font-medium text-[var(--brand)] hover:underline"
              >
                Alterar palavra-passe
              </Link>
            </div>
            <SettingsRow
              label="Exportar os meus dados"
              description="Descarrega um ficheiro JSON com o teu perfil, progresso, notas, eventos e objetivos."
            >
              <Button
                variant="secondary"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? "A exportar..." : "Exportar"}
              </Button>
            </SettingsRow>
            <div className="px-5 py-4">
              <Button variant="secondary" onClick={handleSignOut}>
                Sair
              </Button>
            </div>
            <div className="px-5 py-4 border-t border-[var(--border-light)]">
              <p className="text-[14px] font-medium text-[var(--text-primary)] mb-1">
                Apagar a minha conta
              </p>
              <p className="text-[12px] text-[var(--text-muted)] mb-3">
                Isto apagará permanentemente a tua conta e todos os dados associados.
              </p>
              <Button
                variant="secondary"
                className="border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/30"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Apagar conta
              </Button>
            </div>
          </Section>
        </PageContainer>
      </ProtectedRoute>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar apagar conta"
        >
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-[12px] shadow-xl max-w-md w-full p-6">
            <h3 className="text-[18px] font-semibold text-[var(--text-primary)] mb-2">
              Tens a certeza?
            </h3>
            <p className="text-[14px] text-[var(--text-secondary)] mb-4">
              Esta ação é irreversível. Escreve &quot;APAGAR&quot; para confirmar:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="APAGAR"
              className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-3 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--brand)] outline-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmText.trim().toUpperCase() !== "APAGAR"}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50"
              >
                Apagar permanentemente
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader, SectionLabel } from "@/components/primitives";
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
      <SectionLabel>{title}</SectionLabel>
      <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg divide-y divide-[rgba(0,0,0,0.06)]">
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
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-[13px] font-medium text-[#111111]">{label}</p>
        {description && (
          <p className="text-[12px] text-[#9B9DA3] mt-0.5">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
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
      supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle(),
      getOnboardingData(),
      getActiveGoals(),
    ]);

    if (!settingsRes.data && !settingsRes.error) {
      await supabase.from("user_settings").insert({
        user_id: user.id,
        pronunciation_speed: 0.85,
        show_phonetics: true,
        daily_goal: 10,
        theme: "system",
        show_translations: true,
        preferred_study_time: "evening",
      });
    }

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
    } else {
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
        <ProtectedRoute>
          <PageShell>
            <div className="max-w-[640px] space-y-8">
              <p className="text-[13px] text-[#6C6B71]">A carregar...</p>
            </div>
          </PageShell>
        </ProtectedRoute>
      </>
    );
  }

  return (
    <>
      <ProtectedRoute>
        <PageShell>
          <div className="max-w-[640px] space-y-8">
            <PageHeader title="Definições" subtitle="Manage your account and preferences" />

            {message && (
              <div
                className={`rounded-lg p-3 text-[12px] ${
                  message.type === "ok"
                    ? "border-[0.5px] border-[#E1F5EE] bg-[#E1F5EE] text-[#0F6E56]"
                    : "border-[0.5px] border-[#fecaca] bg-[#fef2f2] text-[#dc2626]"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Learning profile */}
            <Section title="O teu perfil de aprendizagem">
              {onboardingComplete ? (
                <>
                  <div className="px-4 py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-[#9B9DA3]">Motivação</p>
                      {editingField === "motivation" ? (
                        <select
                          autoFocus
                          value={onboarding?.learningMotivation ?? ""}
                          onChange={(e) =>
                            saveOnboardingField({ learningMotivation: e.target.value })
                          }
                          onBlur={() => setEditingField(null)}
                          className="mt-1 w-full rounded-lg border-[0.5px] border-[rgba(0,0,0,0.06)] bg-white px-3 py-1.5 text-[13px] text-[#111111] focus:border-[rgba(0,0,0,0.12)] outline-none"
                        >
                          {MOTIVATION_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-[13px] font-medium text-[#111111] mt-0.5">
                          {motivationLabel}
                          {savedField === "onboarding" && (
                            <span className="ml-2 text-[12px] text-[#0F6E56]">
                              Guardado
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingField((f) => (f === "motivation" ? null : "motivation"))}
                      className="shrink-0 p-2 rounded-lg text-[#9B9DA3] hover:bg-[#F7F7F5] hover:text-[#111111]"
                      aria-label="Editar motivação"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-[#9B9DA3]">Nível atual</p>
                      {editingField === "level" ? (
                        <select
                          autoFocus
                          value={onboarding?.selfAssessedLevel ?? ""}
                          onChange={(e) =>
                            saveOnboardingField({ selfAssessedLevel: e.target.value })
                          }
                          onBlur={() => setEditingField(null)}
                          className="mt-1 w-full rounded-lg border-[0.5px] border-[rgba(0,0,0,0.06)] bg-white px-3 py-1.5 text-[13px] text-[#111111] focus:border-[rgba(0,0,0,0.12)] outline-none"
                        >
                          {LEVEL_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-[13px] font-medium text-[#111111] mt-0.5">
                          {levelLabel}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingField((f) => (f === "level" ? null : "level"))}
                      className="shrink-0 p-2 rounded-lg text-[#9B9DA3] hover:bg-[#F7F7F5] hover:text-[#111111]"
                      aria-label="Editar nível"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-[#9B9DA3]">Dias de estudo</p>
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
                          className="mt-1 w-full rounded-lg border-[0.5px] border-[rgba(0,0,0,0.06)] bg-white px-3 py-1.5 text-[13px] text-[#111111] focus:border-[rgba(0,0,0,0.12)] outline-none"
                        >
                          {STUDY_DAYS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-[13px] font-medium text-[#111111] mt-0.5">
                          {studyDaysLabel}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingField((f) => (f === "studyDays" ? null : "studyDays"))}
                      className="shrink-0 p-2 rounded-lg text-[#9B9DA3] hover:bg-[#F7F7F5] hover:text-[#111111]"
                      aria-label="Editar dias de estudo"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-[#9B9DA3]">Objetivo</p>
                      {editingField === "targetGoal" ? (
                        <select
                          autoFocus
                          value={onboarding?.targetGoal ?? ""}
                          onChange={(e) =>
                            saveOnboardingField({ targetGoal: e.target.value })
                          }
                          onBlur={() => setEditingField(null)}
                          className="mt-1 w-full rounded-lg border-[0.5px] border-[rgba(0,0,0,0.06)] bg-white px-3 py-1.5 text-[13px] text-[#111111] focus:border-[rgba(0,0,0,0.12)] outline-none"
                        >
                          {TARGET_GOAL_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-[13px] font-medium text-[#111111] mt-0.5">
                          {targetGoalLabel}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingField((f) => (f === "targetGoal" ? null : "targetGoal"))}
                      className="shrink-0 p-2 rounded-lg text-[#9B9DA3] hover:bg-[#F7F7F5] hover:text-[#111111]"
                      aria-label="Editar objetivo"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-[#9B9DA3]">Data alvo</p>
                      {editingField === "targetDate" ? (
                        <input
                          type="date"
                          autoFocus
                          value={onboarding?.targetDate ?? ""}
                          onChange={(e) =>
                            saveOnboardingField({ targetDate: e.target.value || undefined })
                          }
                          onBlur={() => setEditingField(null)}
                          className="mt-1 w-full rounded-lg border-[0.5px] border-[rgba(0,0,0,0.06)] bg-white px-3 py-1.5 text-[13px] text-[#111111] focus:border-[rgba(0,0,0,0.12)] outline-none"
                        />
                      ) : (
                        <p className="text-[13px] font-medium text-[#111111] mt-0.5">
                          {formatTargetDate(onboarding?.targetDate)}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingField((f) => (f === "targetDate" ? null : "targetDate"))}
                      className="shrink-0 p-2 rounded-lg text-[#9B9DA3] hover:bg-[#F7F7F5] hover:text-[#111111]"
                      aria-label="Editar data alvo"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                  {showGoalRecalcPrompt && (
                    <div className="bg-[rgba(0,51,153,0.05)] border-t-[0.5px] border-[rgba(0,0,0,0.06)] rounded-b-lg px-4 py-3">
                      <p className="text-[13px] text-[#111111] mb-2">
                        As tuas preferências mudaram. Queres atualizar o teu plano de estudo?
                      </p>
                      <Link
                        href="/calendar"
                        className="text-[13px] font-medium text-[#185FA5] hover:underline"
                      >
                        Ir para objetivos no calendário
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="px-4 py-3">
                  <p className="text-[13px] text-[#6C6B71] mb-3">
                    Não fizeste a configuração inicial?
                  </p>
                  <Link
                    href="/onboarding"
                    className="text-[13px] font-medium text-[#185FA5] hover:underline"
                  >
                    Configurar agora
                  </Link>
                </div>
              )}
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
                  className="text-[13px] bg-white border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg px-3 py-1.5 outline-none focus:border-[rgba(0,0,0,0.12)]"
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
                  className={`relative inline-flex h-[18px] w-8 shrink-0 rounded-full transition-colors ${
                    showPhonetics ? "bg-[#185FA5]" : "bg-[rgba(0,0,0,0.12)]"
                  }`}
                >
                  <span
                    className={`inline-block h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-transform ${
                      showPhonetics ? "translate-x-[14px]" : "translate-x-0.5"
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
                  className="text-[13px] bg-white border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg px-3 py-1.5 outline-none focus:border-[rgba(0,0,0,0.12)]"
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
                  className={`relative inline-flex h-[18px] w-8 shrink-0 rounded-full transition-colors ${
                    showTranslations ? "bg-[#185FA5]" : "bg-[rgba(0,0,0,0.12)]"
                  }`}
                >
                  <span
                    className={`inline-block h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-transform ${
                      showTranslations ? "translate-x-[14px]" : "translate-x-0.5"
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
                  className="text-[13px] bg-white border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg px-3 py-1.5 outline-none focus:border-[rgba(0,0,0,0.12)]"
                >
                  {PREFERRED_STUDY_TIME_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </SettingsRow>
              <div className="px-4 py-3">
                <button
                  type="button"
                  onClick={saveSettings}
                  disabled={saving}
                  className="px-4 py-2 text-[13px] font-medium text-white bg-[#111111] rounded-lg hover:bg-[#333] transition-colors disabled:opacity-50"
                >
                  {saving ? "A guardar..." : "Guardar preferências"}
                </button>
              </div>
            </Section>

            {/* Account */}
            <Section title="Conta">
              <SettingsRow label="Nome">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-[180px] text-[13px] bg-white border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg px-3 py-1.5 outline-none focus:border-[rgba(0,0,0,0.12)]"
                />
              </SettingsRow>
              <SettingsRow label="Email">
                <p className="text-[13px] text-[#6C6B71]">{user?.email ?? "—"}</p>
              </SettingsRow>
              <div className="px-4 py-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving}
                  className="px-4 py-2 text-[13px] font-medium text-white bg-[#111111] rounded-lg hover:bg-[#333] transition-colors disabled:opacity-50"
                >
                  {saving ? "A guardar..." : "Guardar perfil"}
                </button>
                <Link
                  href="/auth/update-password"
                  className="text-[13px] font-medium text-[#185FA5] hover:underline"
                >
                  Alterar palavra-passe
                </Link>
              </div>
              <SettingsRow
                label="Exportar os meus dados"
                description="Descarrega um ficheiro JSON com o teu perfil, progresso, notas, eventos e objetivos."
              >
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting}
                  className="px-4 py-2 text-[13px] font-medium text-[#6C6B71] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg hover:border-[rgba(0,0,0,0.12)] transition-colors"
                >
                  {exporting ? "A exportar..." : "Exportar"}
                </button>
              </SettingsRow>
              <div className="px-4 py-3">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-4 py-2 text-[13px] font-medium text-[#6C6B71] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg hover:border-[rgba(0,0,0,0.12)] transition-colors"
                >
                  Sair
                </button>
              </div>
              <div className="px-4 py-3 border-t border-[rgba(0,0,0,0.06)]">
                <p className="text-[13px] font-medium text-[#111111] mb-1">
                  Apagar a minha conta
                </p>
                <p className="text-[12px] text-[#9B9DA3] mb-3">
                  Isto apagará permanentemente a tua conta e todos os dados associados.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 text-[13px] font-medium text-[#dc2626] border-[0.5px] border-[#dc2626] rounded-lg hover:bg-[#fef2f2] transition-colors"
                >
                  Apagar conta
                </button>
              </div>
            </Section>
          </div>
        </PageShell>
      </ProtectedRoute>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar apagar conta"
        >
          <div className="bg-white border-[0.5px] border-[rgba(0,0,0,0.12)] rounded-lg max-w-md w-full p-6">
            <h3 className="text-[16px] font-medium text-[#111111] mb-2">
              Tens a certeza?
            </h3>
            <p className="text-[13px] text-[#6C6B71] mb-4">
              Esta ação é irreversível. Escreve &quot;APAGAR&quot; para confirmar:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="APAGAR"
              className="w-full text-[13px] bg-white border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg px-3 py-1.5 outline-none focus:border-[rgba(0,0,0,0.12)] placeholder:text-[#9B9DA3] mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                className="px-4 py-2 text-[13px] font-medium text-[#6C6B71] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg hover:border-[rgba(0,0,0,0.12)] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmText.trim().toUpperCase() !== "APAGAR"}
                className="px-4 py-2 text-[13px] font-medium text-white bg-[#dc2626] rounded-lg hover:bg-[#b91c1c] disabled:opacity-50 transition-colors"
              >
                Apagar permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

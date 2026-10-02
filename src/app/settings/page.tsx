"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { PageShell, Crumbs } from "@/components/layout/page-shell";
import { Pencil } from "lucide-react";
import { ScreenTitle, Label } from "@/components/aula";
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

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-16">
      <Label className="mb-2 px-1">{title}</Label>
      <div className="divide-y divide-aula-line rounded-xl border border-aula-border bg-white">{children}</div>
    </section>
  );
}

function SettingsRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[52px] items-center justify-between gap-6 px-4 py-2.5">
      <div className="min-w-0">
        <p className="text-[13px] text-aula-text">{label}</p>
        {description && <p className="mt-0.5 text-[11.5px] text-aula-text-3">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

const FIELD = "h-8 rounded-lg border border-aula-border bg-white px-2.5 text-[12.5px] text-aula-text outline-none transition-colors focus:border-aula-accent";
const BTN_PRIMARY = "inline-flex h-8 items-center rounded-lg bg-aula-accent px-3.5 text-[12.5px] font-medium text-white transition-colors hover:bg-aula-accent-hover disabled:opacity-50";
const BTN_SECONDARY = "inline-flex h-8 items-center rounded-lg border border-aula-border bg-white px-3.5 text-[12.5px] font-medium text-aula-text transition-colors hover:border-aula-text-4 disabled:opacity-50";

function Switch({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-5 w-[34px] shrink-0 items-center rounded-full transition-colors ${on ? "bg-aula-accent" : "bg-[#CFCFCB]"}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-[16px]" : "translate-x-[2px]"}`} />
    </button>
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
          <PageShell header={<Crumbs items={[{ label: "Definições" }]} />}>
            <p className="py-16 text-center text-[13px] text-aula-text-3">A carregar…</p>
          </PageShell>
        </ProtectedRoute>
      </>
    );
  }

  const profileRows: {
    key: string;
    label: string;
    value: string;
    current: string;
    options?: { value: string | number; label: string }[];
    save: (v: string) => void;
  }[] = [
    { key: "motivation", label: "Motivação", value: motivationLabel, current: onboarding?.learningMotivation ?? "", options: MOTIVATION_OPTIONS, save: (v) => saveOnboardingField({ learningMotivation: v }) },
    { key: "level", label: "Nível atual", value: levelLabel, current: onboarding?.selfAssessedLevel ?? "", options: LEVEL_OPTIONS, save: (v) => saveOnboardingField({ selfAssessedLevel: v }) },
    { key: "studyDays", label: "Dias de estudo", value: studyDaysLabel, current: String(onboarding?.studyDaysPerWeek ?? 3), options: STUDY_DAYS_OPTIONS, save: (v) => saveOnboardingField({ studyDaysPerWeek: Number(v) }) },
    { key: "targetGoal", label: "Objetivo", value: targetGoalLabel, current: onboarding?.targetGoal ?? "", options: TARGET_GOAL_OPTIONS, save: (v) => saveOnboardingField({ targetGoal: v }) },
    { key: "targetDate", label: "Data alvo", value: formatTargetDate(onboarding?.targetDate), current: onboarding?.targetDate ?? "", save: (v) => saveOnboardingField({ targetDate: v || undefined }) },
  ];

  const panel = (
    <div className="flex flex-col gap-6">
      <div>
        <Label className="mb-2">Nesta página</Label>
        {[
          { id: "perfil", label: "Perfil de aprendizagem" },
          { id: "preferencias", label: "Preferências" },
          { id: "conta", label: "Conta" },
        ].map((x) => (
          <a key={x.id} href={`#${x.id}`} className="flex h-7 items-center rounded-md px-2 text-[12.5px] text-aula-text-2 hover:bg-aula-sunken hover:text-aula-text">
            {x.label}
          </a>
        ))}
      </div>
      <p className="text-[11.5px] leading-relaxed text-aula-text-3">As mudanças no perfil ficam guardadas logo. As preferências e o nome guardam-se com o botão de cada secção.</p>
    </div>
  );

  return (
    <>
      <ProtectedRoute>
        <PageShell header={<Crumbs items={[{ label: "Definições" }]} />} panel={panel}>
          <div className="mx-auto flex max-w-[680px] flex-col gap-8 pb-16">
            <ScreenTitle title="Definições" subtitle="A tua conta e as tuas preferências" />

            {message && (
              <div
                className={`rounded-[10px] border px-3.5 py-2.5 text-[12.5px] ${
                  message.type === "ok" ? "border-[#BFE3D8] bg-[#E1F2ED] text-[#1F7A68]" : "border-[#F0C9BE] bg-[#FBE9E4] text-aula-overdue"
                }`}
              >
                {message.text}
              </div>
            )}

            <Section id="perfil" title="Perfil de aprendizagem">
              {onboardingComplete ? (
                <>
                  {profileRows.map((r) => (
                    <div key={r.key} className="flex min-h-[52px] items-center gap-4 px-4 py-2.5">
                      <span className="w-[120px] shrink-0 text-[12.5px] text-aula-text-3">{r.label}</span>
                      <div className="min-w-0 flex-1">
                        {editingField === r.key ? (
                          r.options ? (
                            <select autoFocus value={r.current} onChange={(e) => r.save(e.target.value)} onBlur={() => setEditingField(null)} className={`${FIELD} w-full`}>
                              {r.options.map((o) => (
                                <option key={String(o.value)} value={String(o.value)}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input type="date" autoFocus value={r.current} onChange={(e) => r.save(e.target.value)} onBlur={() => setEditingField(null)} className={`${FIELD} w-full`} />
                          )
                        ) : (
                          <span className="text-[13px] text-aula-text">{r.value}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingField((f) => (f === r.key ? null : r.key))}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-aula-text-3 transition-colors hover:bg-aula-sunken hover:text-aula-text"
                        aria-label={`Editar ${r.label.toLowerCase()}`}
                      >
                        <Pencil size={13} strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                  {savedField === "onboarding" && <p className="px-4 py-2 text-[11.5px] text-[#1F7A68]">Guardado</p>}
                  {showGoalRecalcPrompt && (
                    <div className="flex items-center gap-3 rounded-b-xl bg-aula-accent-faint px-4 py-3">
                      <p className="flex-1 text-[12.5px] text-aula-text">As tuas preferências mudaram. Queres ajustar o plano de estudo?</p>
                      <Link href="/calendar" className="text-[12.5px] font-medium text-aula-accent">
                        Ver objetivos →
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <p className="flex-1 text-[13px] text-aula-text-2">Ainda não fizeste a configuração inicial.</p>
                  <Link href="/onboarding" className={BTN_PRIMARY}>
                    Configurar agora
                  </Link>
                </div>
              )}
            </Section>

            <Section id="preferencias" title="Preferências">
              <SettingsRow label="Velocidade da pronúncia" description="Lento, normal ou rápido">
                <select value={pronunciationSpeed} onChange={(e) => setPronunciationSpeed(Number(e.target.value))} className={FIELD}>
                  {SPEED_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </SettingsRow>
              <SettingsRow label="Mostrar fonética" description="A pronúncia escrita ao lado de cada palavra">
                <Switch on={showPhonetics} onChange={() => setShowPhonetics((v) => !v)} label="Mostrar fonética" />
              </SettingsRow>
              <SettingsRow label="Mostrar traduções em inglês" description="Desliga para uma experiência mais imersiva">
                <Switch on={showTranslations} onChange={() => setShowTranslations((v) => !v)} label="Mostrar traduções em inglês" />
              </SettingsRow>
              <SettingsRow label="Palavras novas por dia">
                <select value={dailyGoal} onChange={(e) => setDailyGoal(Number(e.target.value))} className={FIELD}>
                  {DAILY_GOAL_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </SettingsRow>
              <SettingsRow label="Melhor hora para estudar" description="Para lembretes no futuro">
                <select value={preferredStudyTime} onChange={(e) => setPreferredStudyTime(e.target.value)} className={FIELD}>
                  {PREFERRED_STUDY_TIME_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </SettingsRow>
              <div className="flex justify-end px-4 py-3">
                <button type="button" onClick={saveSettings} disabled={saving} className={BTN_PRIMARY}>
                  {saving ? "A guardar…" : "Guardar preferências"}
                </button>
              </div>
            </Section>

            <Section id="conta" title="Conta">
              <SettingsRow label="Nome">
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={`${FIELD} w-[200px]`} />
              </SettingsRow>
              <SettingsRow label="Email">
                <span className="text-[12.5px] text-aula-text-2">{user?.email ?? "—"}</span>
              </SettingsRow>
              <div className="flex items-center gap-2 px-4 py-3">
                <Link href="/auth/update-password" className="text-[12.5px] font-medium text-aula-accent">
                  Alterar palavra-passe
                </Link>
                <span className="flex-1" />
                <button type="button" onClick={saveProfile} disabled={saving} className={BTN_PRIMARY}>
                  {saving ? "A guardar…" : "Guardar perfil"}
                </button>
              </div>
              <SettingsRow label="Exportar os meus dados" description="Um ficheiro JSON com perfil, progresso, notas, eventos e objetivos">
                <button type="button" onClick={handleExport} disabled={exporting} className={BTN_SECONDARY}>
                  {exporting ? "A exportar…" : "Exportar"}
                </button>
              </SettingsRow>
              <SettingsRow label="Sair da conta">
                <button type="button" onClick={handleSignOut} className={BTN_SECONDARY}>
                  Sair
                </button>
              </SettingsRow>
              <SettingsRow label="Apagar a minha conta" description="Apaga para sempre a conta e todos os dados">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex h-8 items-center rounded-lg border border-[#F0C9BE] bg-white px-3.5 text-[12.5px] font-medium text-aula-overdue transition-colors hover:bg-[#FBE9E4]"
                >
                  Apagar conta
                </button>
              </SettingsRow>
            </Section>
          </div>
        </PageShell>
      </ProtectedRoute>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar apagar conta"
        >
          <div className="w-full max-w-md rounded-2xl border border-aula-border bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
            <h3 className="mb-1.5 text-[15px] font-semibold text-aula-text">
              Tens a certeza?
            </h3>
            <p className="mb-4 text-[12.5px] text-aula-text-2">
              Esta ação é irreversível. Escreve &quot;APAGAR&quot; para confirmar:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="APAGAR"
              className="mb-4 h-9 w-full rounded-lg border border-aula-border bg-white px-3 text-[13px] outline-none placeholder:text-aula-text-4 focus:border-aula-accent"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                className={BTN_SECONDARY}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmText.trim().toUpperCase() !== "APAGAR"}
                className="inline-flex h-8 items-center rounded-lg bg-aula-overdue px-3.5 text-[12.5px] font-medium text-white transition-colors disabled:opacity-40"
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

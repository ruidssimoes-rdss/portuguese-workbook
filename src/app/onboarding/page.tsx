"use client";

import { AuthLogo } from "@/components/auth-ui";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import {
  hasCompletedOnboarding,
  saveOnboardingData,
  skipOnboarding,
} from "@/lib/onboarding-service";

const TOTAL_STEPS = 5;

const MOTIVATION_OPTIONS = [
  { value: "moving-to-portugal", labelPt: "Vou mudar-me para Portugal", labelEn: "Moving to Portugal" },
  { value: "family", labelPt: "Família / parceiro(a) português(a)", labelEn: "Family / partner is Portuguese" },
  { value: "travel", labelPt: "Viagens e férias", labelEn: "Travel & holidays" },
  { value: "work", labelPt: "Trabalho / negócios", labelEn: "Work / business" },
  { value: "cultural-interest", labelPt: "Interesse cultural", labelEn: "Cultural interest" },
  { value: "ciple-exam", labelPt: "Preparação para o exame CIPLE", labelEn: "Preparing for the CIPLE exam" },
  { value: "curious", labelPt: "Apenas curiosidade", labelEn: "Just curious" },
];

const LEVEL_OPTIONS = [
  { value: "complete-beginner", labelPt: "Iniciante total — não sei nada", labelEn: "Complete beginner — I know nothing" },
  { value: "some-basics", labelPt: "Sei algumas coisas básicas — cumprimentos, frases simples", labelEn: "I know some basics — greetings, simple sentences" },
  { value: "basic-conversations", labelPt: "Consigo ter conversas básicas", labelEn: "I can have basic conversations" },
  { value: "intermediate-gaps", labelPt: "Sou intermédio mas tenho lacunas", labelEn: "I'm intermediate but have gaps" },
];

const FREQUENCY_OPTIONS = [
  { value: 2, days: "1–2 dias", labelPt: "Casual" },
  { value: 4, days: "3–4 dias", labelPt: "Constante" },
  { value: 6, days: "5–6 dias", labelPt: "Dedicado" },
  { value: 7, days: "Todos os dias", labelPt: "Intensivo" },
];

const GOAL_OPTIONS = [
  { value: "no-goal", labelPt: "Sem objetivo específico — estou a explorar", labelEn: "No specific goal — just exploring" },
  { value: "reach-a2", labelPt: "Alcançar o nível A2", labelEn: "Reach A2 level" },
  { value: "reach-b1", labelPt: "Alcançar o nível B1", labelEn: "Reach B1 level" },
  { value: "pass-ciple-a2", labelPt: "Passar o exame CIPLE A2", labelEn: "Pass the CIPLE A2 exam" },
  { value: "pass-ciple-b1", labelPt: "Passar o exame CIPLE B1", labelEn: "Pass the CIPLE B1 exam" },
  { value: "conversational", labelPt: "Ser capaz de conversar", labelEn: "Be conversational" },
];

const GOALS_WITH_DATE = ["reach-a2", "reach-b1", "pass-ciple-a2", "pass-ciple-b1", "conversational"];

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [pageReady, setPageReady] = useState(false);

  const [motivation, setMotivation] = useState("");
  const [level, setLevel] = useState("");
  const [studyDays, setStudyDays] = useState<number | null>(null);
  const [targetGoal, setTargetGoal] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    hasCompletedOnboarding().then((completed) => {
      if (completed) {
        router.push("/");
        return;
      }
      setPageReady(true);
    });
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user?.id || currentStep !== 4) return;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.display_name) setDisplayName(data.display_name);
      });
  }, [user?.id, currentStep]);

  const showDatePicker = targetGoal && GOALS_WITH_DATE.includes(targetGoal);

  const canProceed =
    currentStep === 0 ? !!motivation :
    currentStep === 1 ? !!level :
    currentStep === 2 ? studyDays !== null :
    currentStep === 3 ? !!targetGoal :
    true;

  const goBack = () => {
    setSaveError(null);
    setCurrentStep((s) => Math.max(0, s - 1));
  };

  const goNext = () => {
    setSaveError(null);
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    setSaveError(null);
    const ok = await saveOnboardingData({
      learningMotivation: motivation,
      selfAssessedLevel: level,
      studyDaysPerWeek: studyDays ?? 3,
      targetGoal,
      targetDate: targetDate || undefined,
      displayName: displayName || undefined,
    });
    setSaving(false);
    if (ok) {
      router.push("/");
    } else {
      setSaveError("Algo correu mal. Tenta novamente.");
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    const ok = await skipOnboarding();
    setSaving(false);
    if (ok) router.push("/");
    else setSaveError("Algo correu mal. Tenta novamente.");
  };

  if (!pageReady || authLoading || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-aula-canvas">
        <p className="text-[12.5px] text-aula-text-3">A carregar…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-aula-canvas px-4 py-12">
      <AuthLogo />
      <div className="w-full max-w-[520px] rounded-2xl border border-aula-line bg-white px-7 pb-6 pt-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex flex-1 gap-1">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= currentStep ? "bg-aula-accent" : "bg-aula-line"}`} aria-hidden />
          ))}
        </div>
        <span className="text-[11px] text-aula-text-3">
          {currentStep + 1} de {TOTAL_STEPS}
        </span>
      </div>

      {currentStep === 0 && (
        <div className="w-full animate-fade-in">
          <div className="mb-6">
            <h1 className="mb-1 text-[20px] font-semibold leading-tight tracking-[-0.02em] text-aula-text">
              Porque queres aprender português?
            </h1>
            <p className="text-[12.5px] text-aula-text-3">Why are you learning Portuguese?</p>
          </div>
          <div className="mb-6 space-y-2">
            {MOTIVATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMotivation(opt.value)}
                className={`w-full rounded-[10px] border px-4 py-3 text-left transition-colors ${
                  motivation === opt.value
                    ? "border-aula-accent bg-aula-accent-faint"
                    : "border-aula-border hover:border-aula-text-4"
                }`}
              >
                <p className={`text-[13.5px] font-medium ${motivation === opt.value ? "text-aula-accent" : "text-aula-text"}`}>
                  {opt.labelPt}
                </p>
                <p className="mt-0.5 text-[12px] text-aula-text-3">{opt.labelEn}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <div className="w-full animate-fade-in">
          <div className="mb-6">
            <h1 className="mb-1 text-[20px] font-semibold leading-tight tracking-[-0.02em] text-aula-text">
              Como descreverias o teu nível atual?
            </h1>
            <p className="text-[12.5px] text-aula-text-3">How would you describe your current level?</p>
          </div>
          <div className="mb-6 space-y-2">
            {LEVEL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLevel(opt.value)}
                className={`w-full rounded-[10px] border px-4 py-3 text-left transition-colors ${
                  level === opt.value
                    ? "border-aula-accent bg-aula-accent-faint"
                    : "border-aula-border hover:border-aula-text-4"
                }`}
              >
                <p className={`text-[13.5px] font-medium ${level === opt.value ? "text-aula-accent" : "text-aula-text"}`}>
                  {opt.labelPt}
                </p>
                <p className="mt-0.5 text-[12px] text-aula-text-3">{opt.labelEn}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="w-full animate-fade-in">
          <div className="mb-6">
            <h1 className="mb-1 text-[20px] font-semibold leading-tight tracking-[-0.02em] text-aula-text">
              Quantos dias por semana podes estudar?
            </h1>
            <p className="text-[12.5px] text-aula-text-3">How many days per week can you study?</p>
          </div>
          <div className="mb-6 grid grid-cols-2 gap-2">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStudyDays(opt.value)}
                className={`rounded-[10px] border px-4 py-4 text-center transition-colors ${
                  studyDays === opt.value
                    ? "border-aula-accent bg-aula-accent-faint"
                    : "border-aula-border hover:border-aula-text-4"
                }`}
              >
                <p className={`mb-0.5 text-[20px] font-semibold ${studyDays === opt.value ? "text-aula-accent" : "text-aula-text"}`}>
                  {opt.days}
                </p>
                <p className="text-[12px] text-aula-text-3">{opt.labelPt}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="w-full animate-fade-in">
          <div className="mb-6">
            <h1 className="mb-1 text-[20px] font-semibold leading-tight tracking-[-0.02em] text-aula-text">
              Qual é o teu objetivo?
            </h1>
            <p className="text-[12.5px] text-aula-text-3">What&apos;s your target?</p>
          </div>
          <div className="mb-4 space-y-2">
            {GOAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTargetGoal(opt.value)}
                className={`w-full rounded-[10px] border px-4 py-3 text-left transition-colors ${
                  targetGoal === opt.value
                    ? "border-aula-accent bg-aula-accent-faint"
                    : "border-aula-border hover:border-aula-text-4"
                }`}
              >
                <p className={`text-[13.5px] font-medium ${targetGoal === opt.value ? "text-aula-accent" : "text-aula-text"}`}>
                  {opt.labelPt}
                </p>
                <p className="mt-0.5 text-[12px] text-aula-text-3">{opt.labelEn}</p>
              </button>
            ))}
          </div>
          {showDatePicker && (
            <div className="mb-6">
              <label htmlFor="target-date" className="mb-1.5 block text-[12px] font-medium text-aula-text-2">
                Até quando? / By when?
              </label>
              <input
                id="target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="h-10 w-full max-w-[240px] rounded-lg border border-aula-border px-3 text-[13.5px] text-aula-text outline-none focus:border-aula-accent"
              />
            </div>
          )}
          {!showDatePicker && <div className="mb-2" />}
        </div>
      )}

      {currentStep === 4 && (
        <div className="w-full animate-fade-in">
          <div className="mb-6">
            <h1 className="mb-1 text-[20px] font-semibold leading-tight tracking-[-0.02em] text-aula-text">
              Como te chamas?
            </h1>
            <p className="text-[12.5px] text-aula-text-3">What should we call you?</p>
          </div>
          <div className="mb-6">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="O teu nome"
              className="h-11 w-full rounded-lg border border-aula-border bg-white px-3.5 text-[15px] font-medium text-aula-text outline-none transition-colors placeholder:font-normal placeholder:text-aula-text-4 focus:border-aula-accent"
            />
          </div>
        </div>
      )}

      <div className="flex w-full items-center justify-between border-t border-aula-line pt-4">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-9 items-center rounded-lg px-3 text-[13px] font-medium text-aula-text-2 transition-colors hover:bg-aula-sunken hover:text-aula-text"
          >
            ← Anterior
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={goNext}
          disabled={!canProceed || saving}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-aula-accent px-5 text-[13px] font-medium text-white transition-colors hover:bg-aula-accent-hover disabled:cursor-not-allowed disabled:opacity-35"
        >
          {saving ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" aria-hidden />
              A guardar…
            </>
          ) : currentStep === TOTAL_STEPS - 1 ? "Começar" : "Próximo →"}
        </button>
      </div>

      {saveError && <p className="mt-3 text-[12.5px] text-aula-overdue">{saveError}</p>}
      </div>

      <button
        type="button"
        onClick={handleSkip}
        disabled={saving}
        className="mt-4 min-h-[36px] text-[12px] text-aula-text-3 transition-colors hover:text-aula-text-2 disabled:opacity-50"
      >
        Saltar configuração
      </button>
    </div>
  );
}

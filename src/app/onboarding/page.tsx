"use client";

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[15px] text-[#9CA3AF]">A carregar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="flex gap-2 mb-12">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              i <= currentStep ? "bg-[#003399]" : "bg-[#E5E7EB]"
            }`}
            aria-hidden
          />
        ))}
      </div>

      {currentStep === 0 && (
        <div className="w-full max-w-lg animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-[24px] font-bold text-[#111827] mb-2 leading-tight">
              Porque queres aprender português?
            </h1>
            <p className="text-[15px] text-[#9CA3AF]">Why are you learning Portuguese?</p>
          </div>
          <div className="space-y-3 mb-12">
            {MOTIVATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMotivation(opt.value)}
                className={`w-full text-left px-5 py-4 rounded-[12px] border transition-all duration-200 min-h-[48px] ${
                  motivation === opt.value
                    ? "border-[#003399] bg-[#003399]/5 shadow-sm"
                    : "border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#FAFAFA]"
                }`}
              >
                <p className={`text-[15px] font-medium ${motivation === opt.value ? "text-[#003399]" : "text-[#111827]"}`}>
                  {opt.labelPt}
                </p>
                <p className="text-[13px] text-[#9CA3AF] mt-0.5">{opt.labelEn}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <div className="w-full max-w-lg animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-[24px] font-bold text-[#111827] mb-2 leading-tight">
              Como descreverias o teu nível atual?
            </h1>
            <p className="text-[15px] text-[#9CA3AF]">How would you describe your current level?</p>
          </div>
          <div className="space-y-3 mb-12">
            {LEVEL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLevel(opt.value)}
                className={`w-full text-left px-5 py-4 rounded-[12px] border transition-all duration-200 min-h-[48px] ${
                  level === opt.value
                    ? "border-[#003399] bg-[#003399]/5 shadow-sm"
                    : "border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#FAFAFA]"
                }`}
              >
                <p className={`text-[15px] font-medium ${level === opt.value ? "text-[#003399]" : "text-[#111827]"}`}>
                  {opt.labelPt}
                </p>
                <p className="text-[13px] text-[#9CA3AF] mt-0.5">{opt.labelEn}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="w-full max-w-lg animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-[24px] font-bold text-[#111827] mb-2 leading-tight">
              Quantos dias por semana podes estudar?
            </h1>
            <p className="text-[15px] text-[#9CA3AF]">How many days per week can you study?</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-12">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStudyDays(opt.value)}
                className={`text-center px-4 py-6 rounded-[12px] border transition-all duration-200 min-h-[48px] ${
                  studyDays === opt.value
                    ? "border-[#003399] bg-[#003399]/5 shadow-sm"
                    : "border-[#E5E7EB] hover:border-[#D1D5DB]"
                }`}
              >
                <p className={`text-[20px] font-bold mb-1 ${studyDays === opt.value ? "text-[#003399]" : "text-[#111827]"}`}>
                  {opt.days}
                </p>
                <p className="text-[13px] text-[#9CA3AF]">{opt.labelPt}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="w-full max-w-lg animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-[24px] font-bold text-[#111827] mb-2 leading-tight">
              Qual é o teu objetivo?
            </h1>
            <p className="text-[15px] text-[#9CA3AF]">What&apos;s your target?</p>
          </div>
          <div className="space-y-3 mb-6">
            {GOAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTargetGoal(opt.value)}
                className={`w-full text-left px-5 py-4 rounded-[12px] border transition-all duration-200 min-h-[48px] ${
                  targetGoal === opt.value
                    ? "border-[#003399] bg-[#003399]/5 shadow-sm"
                    : "border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#FAFAFA]"
                }`}
              >
                <p className={`text-[15px] font-medium ${targetGoal === opt.value ? "text-[#003399]" : "text-[#111827]"}`}>
                  {opt.labelPt}
                </p>
                <p className="text-[13px] text-[#9CA3AF] mt-0.5">{opt.labelEn}</p>
              </button>
            ))}
          </div>
          {showDatePicker && (
            <div className="mb-12">
              <label htmlFor="target-date" className="block text-center text-[14px] font-medium text-[#6B7280] mb-2">
                Até quando? / By when?
              </label>
              <input
                id="target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full max-w-[240px] mx-auto block rounded-[12px] border border-[#E5E7EB] px-4 py-3 text-[15px] text-[#111827] focus:border-[#003399] focus:ring-1 focus:ring-[#003399] outline-none"
              />
            </div>
          )}
          {!showDatePicker && <div className="mb-12" />}
        </div>
      )}

      {currentStep === 4 && (
        <div className="w-full max-w-lg animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-[24px] font-bold text-[#111827] mb-2 leading-tight">
              Como te chamas?
            </h1>
            <p className="text-[15px] text-[#9CA3AF]">What should we call you?</p>
          </div>
          <div className="mb-12">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="O teu nome"
              className="w-full text-center text-[22px] font-bold text-[#111827] border-b-2 border-[#E5E7EB] focus:border-[#003399] outline-none pb-3 bg-transparent transition-colors duration-200"
            />
          </div>
        </div>
      )}

      <div className="max-w-lg w-full flex items-center justify-between">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="text-[14px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
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
          className="inline-flex items-center justify-center px-8 py-3 bg-[#003399] text-white text-[14px] font-medium rounded-[12px] hover:bg-[#002277] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        >
          {saving ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" aria-hidden />
              A guardar...
            </>
          ) : currentStep === TOTAL_STEPS - 1 ? "Começar" : "Próximo →"}
        </button>
      </div>

      {saveError && (
        <p className="mt-4 text-[13px] text-[#DC2626]">{saveError}</p>
      )}

      <button
        type="button"
        onClick={handleSkip}
        disabled={saving}
        className="mt-8 text-[13px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors disabled:opacity-50 min-h-[44px]"
      >
        Saltar configuração
      </button>
    </div>
  );
}

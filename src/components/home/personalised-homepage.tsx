"use client";

import Link from "next/link";
import { PronunciationButton } from "@/components/pronunciation-button";
import { CEFRBadge, VerbGroupBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { PageContainer } from "@/components/ui/page-container";
import type { HomepageData } from "@/lib/homepage-service";

export interface HomeStaticData {
  wordOfDay: {
    word: { portuguese: string; english: string; pronunciation?: string; example?: string; exampleTranslation?: string; cefr?: string; gender?: string };
    categoryTitle: string;
  } | null;
  verbKey: string | null;
  verbOfDay: {
    meta: { english: string; cefr?: string; group?: string };
    presentRows: { person: string; conjugation: string }[];
  } | null;
  sayingOfDay: { portuguese: string; meaning: string; literal?: string; pronunciation?: string; cefr?: string } | null;
  totalVocabWords: number;
  totalVerbs: number;
  totalGrammarTopics: number;
  sayingsLength: number;
}

function shortGroup(group: string): string {
  if (group.startsWith("Irregular")) return "Irregular";
  if (group.startsWith("Regular -AR")) return "-AR";
  if (group.startsWith("Regular -ER")) return "-ER";
  if (group.startsWith("Regular -IR")) return "-IR";
  return group;
}

function getSubtitle(data: HomepageData): string {
  const streak = data.currentStreak;
  const last = data.lastActiveDate;
  if (streak >= 7) return `Estás numa série de ${streak} dias — continua assim!`;
  if (streak >= 3) return `Já são ${streak} dias consecutivos!`;
  if (last) {
    const lastDate = new Date(last);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / 86400000);
    if (diffDays >= 3) return `Não estudas há ${diffDays} dias — vamos voltar?`;
    if (diffDays >= 1) return "Voltaste! Vamos continuar?";
  }
  if (data.totalWordsEncountered >= 100 && data.totalWordsEncountered < 200)
    return `Já aprendeste ${data.totalWordsEncountered} palavras — impressionante!`;
  return "Vamos continuar a aprender.";
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export function PersonalisedHomepage({
  data,
  staticData,
}: {
  data: HomepageData;
  staticData: HomeStaticData;
}) {
  const greeting = getGreeting();
  const subtitle = getSubtitle(data);
  const hasWeakAreas = data.weakVerbs.length > 0 || data.weakCategories.length > 0 || data.weakGrammar.length > 0;

  return (
    <>
      <section className="w-full bg-bg">
        <div className="max-w-[1280px] mx-auto px-6 pt-14 pb-8">
          <div className="mb-8">
            <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">
              {greeting}, {data.displayName}
            </h1>
            <p className="text-[15px] text-[#6B7280] mt-1">{subtitle}</p>
          </div>
        </div>
      </section>
      <PageContainer>
        {/* Continue Learning */}
        <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-6 mb-6">
          {data.nextLesson ? (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-3">
                A tua próxima lição
              </p>
              <h2 className="text-[20px] font-bold text-[#111827] mb-1">
                {data.nextLesson.titlePt}
              </h2>
              <p className="text-[14px] text-[#6B7280] mb-4">{data.nextLesson.title}</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#003399] rounded-full transition-all duration-500"
                    style={{
                      width: `${data.currentLevelProgress.total > 0 ? (data.currentLevelProgress.completed / data.currentLevelProgress.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-[12px] font-medium text-[#6B7280]">
                  {data.currentLevelProgress.completed}/{data.currentLevelProgress.total} lições
                </span>
              </div>
              <div className="flex justify-end">
                <Link
                  href={`/lessons/${data.nextLesson.id}`}
                  className="px-6 py-2.5 bg-[#003399] text-white text-[14px] font-medium rounded-[12px] hover:bg-[#002277] transition-colors"
                >
                  Continuar
                </Link>
              </div>
            </>
          ) : data.totalLessonsCompleted >= 44 ? (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-3">
                Currículo completo
              </p>
              <h2 className="text-[20px] font-bold text-[#111827] mb-1">Currículo Completo</h2>
              <p className="text-[14px] text-[#6B7280] mb-4">
                Completaste todas as 44 lições. Parabéns! Continua a praticar e a rever.
              </p>
              <div className="flex justify-center gap-3">
                <Link
                  href="/lessons"
                  className="px-5 py-2.5 border border-[#003399] text-[#003399] text-[14px] font-medium rounded-[12px] hover:bg-[#003399]/5 transition-colors"
                >
                  Rever lições
                </Link>
                <Link
                  href="/vocabulary"
                  className="px-5 py-2.5 bg-[#003399] text-white text-[14px] font-medium rounded-[12px] hover:bg-[#002277] transition-colors"
                >
                  Praticar
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-3">
                Parabéns
              </p>
              <h2 className="text-[20px] font-bold text-[#111827] mb-1">Nível completo</h2>
              <p className="text-[14px] text-[#6B7280] mb-4">
                Estás pronto para o próximo nível.
              </p>
              <div className="flex justify-end">
                <Link
                  href="/lessons"
                  className="px-6 py-2.5 bg-[#003399] text-white text-[14px] font-medium rounded-[12px] hover:bg-[#002277] transition-colors"
                >
                  Ver lições
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-[12px] p-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-1">Série</p>
            <p className="text-[22px] font-bold text-[#111827]">{data.currentStreak}</p>
            <p className="text-[11px] text-[#9CA3AF]">{data.currentStreak === 1 ? "dia" : "dias"}</p>
          </div>
          <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-[12px] p-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-1">Palavras</p>
            <p className="text-[22px] font-bold text-[#111827]">{data.totalWordsEncountered}</p>
            <p className="text-[11px] text-[#9CA3AF]">aprendidas</p>
          </div>
          <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-[12px] p-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-1">Nível</p>
            <p className="text-[22px] font-bold text-[#111827]">{data.currentCefrLevel}</p>
            <p className="text-[11px] text-[#9CA3AF]">
              {data.currentLevelProgress.total > 0
                ? `${Math.round((data.currentLevelProgress.completed / data.currentLevelProgress.total) * 100)}%`
                : "—"}
            </p>
          </div>
          <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-[12px] p-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-1">Semana</p>
            <p className="text-[22px] font-bold text-[#111827]">
              {data.weeklyStudyDays}/{data.weeklyTargetDays}
            </p>
            <p className="text-[11px] text-[#9CA3AF]">dias</p>
          </div>
        </div>

        {/* Weekly Rhythm */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-medium text-[#9CA3AF]">{day}</span>
              <div
                className={`w-3 h-3 rounded-full ${data.weekDayActivity[i] ? "bg-[#003399]" : "bg-[#E5E7EB]"}`}
                aria-hidden
              />
            </div>
          ))}
        </div>

        {/* Smart Suggestions */}
        {hasWeakAreas && (
          <div className="mb-8">
            <SectionHeader className="mb-3">Rever hoje</SectionHeader>
            <div className="space-y-3">
              {data.weakVerbs.length > 0 && (
                <div className="border border-[#E5E7EB] rounded-[12px] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-semibold text-[#111827]">Verbos para rever</p>
                    <p className="text-[13px] text-[#6B7280] mt-0.5">
                      {data.weakVerbs.slice(0, 5).join(", ")}
                      {data.weakVerbs.length > 5 ? " — erraste estes recentemente" : " — erraste estes recentemente"}
                    </p>
                  </div>
                  <Link
                    href="/conjugations"
                    className="shrink-0 px-4 py-2 text-[14px] font-medium text-[#003399] hover:text-[#002277]"
                  >
                    Praticar
                  </Link>
                </div>
              )}
              {data.weakCategories.length > 0 && (
                <div className="border border-[#E5E7EB] rounded-[12px] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-semibold text-[#111827]">
                      Vocabulário: {data.weakCategories[0].title}
                    </p>
                    <p className="text-[13px] text-[#6B7280] mt-0.5">Precisas de rever esta categoria</p>
                  </div>
                  <Link
                    href={`/vocabulary/${data.weakCategories[0].id}`}
                    className="shrink-0 px-4 py-2 text-[14px] font-medium text-[#003399] hover:text-[#002277]"
                  >
                    Flashcards
                  </Link>
                </div>
              )}
              {data.weakGrammar.length > 0 && (
                <div className="border border-[#E5E7EB] rounded-[12px] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-semibold text-[#111827]">
                      Gramática: {data.weakGrammar[0].title}
                    </p>
                    <p className="text-[13px] text-[#6B7280] mt-0.5">Volta a ler esta regra</p>
                  </div>
                  <Link
                    href={`/grammar/${data.weakGrammar[0].slug}`}
                    className="shrink-0 px-4 py-2 text-[14px] font-medium text-[#003399] hover:text-[#002277]"
                  >
                    Rever
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Today's Picks */}
        <div className="mt-8">
          <SectionHeader className="mb-3">
            {hasWeakAreas ? "Descobertas do dia" : "Today's Picks"}
          </SectionHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staticData.wordOfDay && (
              <Card className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <SectionHeader>Word of the Day</SectionHeader>
                  {staticData.wordOfDay.word.cefr && (
                    <CEFRBadge level={staticData.wordOfDay.word.cefr} />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <PronunciationButton
                    text={staticData.wordOfDay.word.portuguese}
                    size="sm"
                    variant="dark"
                    className="shrink-0"
                  />
                  <span className="text-[18px] font-semibold text-text">{staticData.wordOfDay.word.portuguese}</span>
                </div>
                <p className="text-[13px] text-text-secondary">{staticData.wordOfDay.word.english}</p>
                {staticData.wordOfDay.word.pronunciation && (
                  <span className="text-[12px] font-mono text-text-muted">
                    /{staticData.wordOfDay.word.pronunciation}/
                  </span>
                )}
                {staticData.wordOfDay.word.example && (
                  <div className="bg-surface rounded-lg px-3 py-2">
                    <p className="text-[13px] italic text-text">&ldquo;{staticData.wordOfDay.word.example}&rdquo;</p>
                    {staticData.wordOfDay.word.exampleTranslation && (
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {staticData.wordOfDay.word.exampleTranslation}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-1.5 flex-wrap mt-auto">
                  {staticData.wordOfDay.word.gender && (
                    <span className="text-xs font-medium text-[#003399] bg-[#003399]/10 rounded-full px-2 py-0.5">
                      {staticData.wordOfDay.word.gender}
                    </span>
                  )}
                  <span className="text-[11px] font-medium text-text-secondary bg-border-light px-2.5 py-[3px] rounded-full">
                    {staticData.wordOfDay.categoryTitle}
                  </span>
                </div>
              </Card>
            )}
            {staticData.verbKey && staticData.verbOfDay && (
              <Card className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <SectionHeader>Verb of the Day</SectionHeader>
                  <div className="flex items-center gap-1.5">
                    {staticData.verbOfDay.meta.cefr && <CEFRBadge level={staticData.verbOfDay.meta.cefr} />}
                    {staticData.verbOfDay.meta.group && (
                      <VerbGroupBadge
                        group={staticData.verbOfDay.meta.group}
                        label={shortGroup(staticData.verbOfDay.meta.group)}
                      />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PronunciationButton
                    text={staticData.verbKey.toLowerCase()}
                    size="sm"
                    variant="dark"
                    className="shrink-0"
                  />
                  <span className="text-[18px] font-semibold text-text">{staticData.verbKey.toLowerCase()}</span>
                </div>
                <p className="text-[13px] text-text-secondary">{staticData.verbOfDay.meta.english}</p>
                <div className="space-y-0.5">
                  {staticData.verbOfDay.presentRows.slice(0, 5).map((row) => (
                    <div key={row.person} className="flex items-baseline gap-3 text-[13px]">
                      <span className="w-[36px] text-text-muted shrink-0">{row.person}</span>
                      <span className="font-medium text-text">{row.conjugation}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/conjugations/${staticData.verbKey.toLowerCase()}`}
                  className="text-[13px] font-medium text-text hover:text-text-secondary transition-all duration-150 ease-out mt-auto"
                >
                  View all tenses
                </Link>
              </Card>
            )}
            {staticData.sayingOfDay && (
              <Card className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <SectionHeader>Saying of the Day</SectionHeader>
                  {staticData.sayingOfDay.cefr && <CEFRBadge level={staticData.sayingOfDay.cefr} />}
                </div>
                <div className="flex items-start gap-2">
                  <PronunciationButton
                    text={staticData.sayingOfDay.portuguese}
                    size="sm"
                    variant="dark"
                    className="shrink-0 mt-0.5"
                  />
                  <p className="text-[15px] font-semibold italic text-text">
                    &ldquo;{staticData.sayingOfDay.portuguese}&rdquo;
                  </p>
                </div>
                <p className="text-[13px] text-text-secondary">{staticData.sayingOfDay.meaning}</p>
                {staticData.sayingOfDay.pronunciation && (
                  <span className="text-[12px] font-mono text-text-muted">
                    /{staticData.sayingOfDay.pronunciation}/
                  </span>
                )}
                {staticData.sayingOfDay.literal && (
                  <div className="flex flex-col gap-1 text-[12px]">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] uppercase tracking-[0.08em] text-text-muted font-semibold shrink-0">
                        Literal
                      </span>
                      <span className="text-text-secondary">{staticData.sayingOfDay.literal}</span>
                    </div>
                  </div>
                )}
                <Link
                  href="/culture"
                  className="text-[13px] font-medium text-text hover:text-text-secondary transition-all duration-150 ease-out mt-auto"
                >
                  Explore culture
                </Link>
              </Card>
            )}
          </div>
        </div>

        {/* Explore */}
        <div className="mt-8">
          <SectionHeader className="mb-3">Explore</SectionHeader>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Conjugations", titlePt: "Conjugações", href: "/conjugations", stat: `${staticData.totalVerbs} verbs` },
              { title: "Vocabulary", titlePt: "Vocabulário", href: "/vocabulary", stat: `${staticData.totalVocabWords} words` },
              { title: "Grammar", titlePt: "Gramática", href: "/grammar", stat: `${staticData.totalGrammarTopics} topics` },
              { title: "Culture", titlePt: "Cultura", href: "/culture", stat: `${staticData.sayingsLength} sayings` },
            ].map((s) => (
              <Link key={s.href} href={s.href} className="block group">
                <Card interactive className="h-full flex flex-col">
                  <span className="text-[15px] font-semibold text-text">{s.title}</span>
                  <span className="text-[13px] text-text-muted italic">{s.titlePt}</span>
                  <span className="text-[12px] text-text-secondary mt-auto pt-3">{s.stat}</span>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-12" />
      </PageContainer>
    </>
  );
}

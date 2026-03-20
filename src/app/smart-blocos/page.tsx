"use client";

import { SmartBloco } from "@/components/smart-bloco";
import { BlocoGrid } from "@/components/smart-bloco/bloco-grid";
import {
  NumberedRules,
  ConjugationTable,
  Comparison,
  DoAvoid,
  Expression,
} from "@/components/smart-bloco-inserts";

// ── Section Header ───────────────────────────────────────

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-[20px]">
      <h2 className="font-[family-name:var(--font-sans)] text-[11px] font-medium uppercase tracking-[0.88px] text-[var(--color-bloco-text-muted)]">
        {title}
      </h2>
      <p className="font-[family-name:var(--font-sans)] text-[13px] font-normal text-[var(--color-bloco-text-secondary)] mt-[4px]">
        {description}
      </p>
    </div>
  );
}

// ── Demo Page ────────────────────────────────────────────

export default function SmartBlocosDemo() {
  return (
    <div className="max-w-[1200px] mx-auto px-[32px] py-[48px] space-y-[64px]">
      <div>
        <h1 className="font-[family-name:var(--font-sans)] text-[24px] font-semibold text-[var(--color-bloco-text)]">
          smartBlocos
        </h1>
        <p className="font-[family-name:var(--font-sans)] text-[14px] font-normal text-[var(--color-bloco-text-secondary)] mt-[4px]">
          Universal card component system — one shell, infinite configurations.
        </p>
      </div>

      {/* ── Frame 1: Full-featured vocab card ─────────────── */}
      <section>
        <SectionHeader
          title="Frame 1 — Universal Shell (all features on)"
          description="Vocab card with audio, CEFR badge, meta badge, example, actions, and footer."
        />
        <SmartBloco
          title="casa"
          pronunciation="/KAH-zah/"
          translation="(house, home)"
          description="Essential vocabulary for talking about your home and living space."
          hasAudio
          cefrLevel="A1"
          metaBadge="fem."
          example={{
            portuguese: "A minha casa é grande.",
            english: "My house is big.",
          }}
          actions={{ hasTip: true, hasCopy: true }}
          footer={{ relatedCount: 4, wordCount: 64 }}
        />
      </section>

      {/* ── Frame 2: Expanded content inserts ─────────────── */}
      <section>
        <SectionHeader
          title="Frame 2 — Expanded Content Inserts"
          description="These render inside the card's expandable area."
        />

        <div className="space-y-[32px]">
          {/* 2a. Numbered Rules */}
          <div>
            <p className="font-[family-name:var(--font-sans)] text-[12px] font-medium text-[var(--color-bloco-text-muted)] mb-[12px]">
              2a. Numbered Rules (Grammar)
            </p>
            <SmartBloco
              title="Definite Articles"
              subtitle="Os Artigos Definidos"
              cefrLevel="A1"
              description="Learn when and how to use o, a, os, as."
              expandedContent={
                <NumberedRules
                  rules={[
                    {
                      number: 1,
                      text: 'Use "o" for masculine singular nouns',
                      textPt: 'Usa-se "o" para substantivos masculinos no singular',
                      example: {
                        pt: "O livro está na mesa.",
                        en: "The book is on the table.",
                      },
                      callout: {
                        type: "tip",
                        text: 'Most nouns ending in -o are masculine, but there are exceptions like "a foto" and "a mão".',
                      },
                    },
                    {
                      number: 2,
                      text: 'Use "a" for feminine singular nouns',
                      textPt: 'Usa-se "a" para substantivos femininos no singular',
                      example: {
                        pt: "A casa é bonita.",
                        en: "The house is beautiful.",
                      },
                      callout: {
                        type: "why",
                        text: "In Portuguese, all nouns have grammatical gender — even abstract concepts like 'a saudade' are masculine or feminine.",
                      },
                    },
                  ]}
                />
              }
              footer={{ ruleCount: 7 }}
            />
          </div>

          {/* 2b. Conjugation Table */}
          <div>
            <p className="font-[family-name:var(--font-sans)] text-[12px] font-medium text-[var(--color-bloco-text-muted)] mb-[12px]">
              2b. Conjugation Table
            </p>
            <SmartBloco
              title="falar"
              translation="to speak"
              hasAudio
              cefrLevel="A1"
              metaBadge="-ar"
              description="Regular -ar verb conjugation."
              expandedContent={
                <ConjugationTable
                  tense="Present"
                  tensePt="Presente"
                  cefrLevel="A1"
                  conjugations={[
                    { pronoun: "eu", form: "falo", example: "Eu falo devagar.", hasAudio: true },
                    { pronoun: "tu", form: "falas", example: "Tu falas rápido.", hasAudio: true },
                    { pronoun: "ele/ela", form: "fala", example: "Ela fala bem.", hasAudio: true },
                    { pronoun: "nós", form: "falamos", example: "Nós falamos juntos.", hasAudio: true },
                    { pronoun: "eles/elas", form: "falam", example: "Eles falam rápido.", hasAudio: true },
                  ]}
                />
              }
              footer={{ label: "Core Verb" }}
            />
          </div>

          {/* 2c. Comparison */}
          <div>
            <p className="font-[family-name:var(--font-sans)] text-[12px] font-medium text-[var(--color-bloco-text-muted)] mb-[12px]">
              2c. False Friends Comparison
            </p>
            <SmartBloco
              title="constipado"
              hasAudio
              cefrLevel="A2"
              description="A common false friend between Portuguese and English."
              expandedContent={
                <Comparison
                  positive={{
                    label: "Actually means",
                    text: "having a cold (resfriado)",
                  }}
                  negative={{ label: "Not", text: "constipated" }}
                />
              }
            />
          </div>

          {/* 2d. Do / Avoid */}
          <div>
            <p className="font-[family-name:var(--font-sans)] text-[12px] font-medium text-[var(--color-bloco-text-muted)] mb-[12px]">
              2d. Do / Avoid (Etiquette)
            </p>
            <SmartBloco
              title="Greetings"
              subtitle="Saudações / Cumprimentos"
              cefrLevel="A1"
              description="Learn basic greetings and introductions in Portuguese."
              expandedContent={
                <DoAvoid
                  doItems={[
                    "Two kisses on the cheek for greetings",
                    'Use "Senhor/Senhora" with elders',
                  ]}
                  avoidItems={[
                    'Avoid using "tu" in formal contexts',
                    "Utilize formal greetings when addressing superiors",
                  ]}
                />
              }
            />
          </div>

          {/* 2e. Expression */}
          <div>
            <p className="font-[family-name:var(--font-sans)] text-[12px] font-medium text-[var(--color-bloco-text-muted)] mb-[12px]">
              2e. Expression / Saying
            </p>
            <SmartBloco
              title="Quem não tem cão, caça com gato."
              cefrLevel="A2"
              description="A popular Portuguese saying about making do."
              expandedContent={
                <Expression
                  meaning="Make do with what you have. If the ideal solution isn't available, find an alternative."
                  usage="Common in everyday conversation when improvising or settling for a workaround."
                  quote={{
                    pt: "Quem não tem cão, caça com gato.",
                    en: "Who doesn't have a dog, hunts with a cat.",
                  }}
                  hasAudio
                />
              }
            />
          </div>
        </div>
      </section>

      {/* ── Frame 3: Stat cards ───────────────────────────── */}
      <section>
        <SectionHeader
          title="Frame 3 — Stat Cards"
          description="Centered layout, same shell, different content alignment."
        />
        <div className="flex flex-wrap gap-[20px]">
          <SmartBloco
            title="Vocabulary"
            stat={{ value: "840", label: "Vocabulary", delta: "+12 this week" }}
          />
          <SmartBloco
            title="Lessons"
            stat={{ value: "32 / 44", label: "Lessons Completed" }}
          />
          <SmartBloco
            title="Level"
            stat={{ value: "A2", label: "Current level" }}
          />
        </div>
      </section>

      {/* ── Frame 4: Lesson progress cards ────────────────── */}
      <section>
        <SectionHeader
          title="Frame 4 — Lesson Progress Cards"
          description="Same shell with progress bar and open/locked states."
        />
        <BlocoGrid>
          <SmartBloco
            title="Greetings"
            subtitle="Saudações / Cumprimentos"
            cefrLevel="A1"
            description="Learn basic greetings and introductions in Portuguese."
            progress={{ percent: 75 }}
            footer={{ label: "Open", itemCount: 24 }}
            onClick={() => {}}
          />
          <SmartBloco
            title="Greetings"
            subtitle="Saudações / Cumprimentos"
            cefrLevel="A2"
            description="Learn basic greetings and introductions in Portuguese."
            progress={{ percent: 0, isLocked: true }}
            footer={{ label: "Locked", itemCount: 24 }}
          />
        </BlocoGrid>
      </section>

      {/* ── Frame 5: Interactive index cards ──────────────── */}
      <section>
        <SectionHeader
          title="Frame 5 — Interactive Index Cards (clickable)"
          description="Features toggled to title + subtitle + description + meta + badge."
        />
        <BlocoGrid>
          <SmartBloco
            title="Definite Articles"
            subtitle="Os Artigos Definidos"
            cefrLevel="A1"
            description="Learn when and how to use o, a, os, as."
            footer={{ ruleCount: 7, questionCount: 20 }}
            onClick={() => {}}
          />
          <SmartBloco
            title="Food & Drink"
            subtitle="Comida e Bebida"
            description="Learn when and how to use o, a, os, as."
            footer={{ wordCount: 64 }}
            onClick={() => {}}
          />
          <SmartBloco
            title="falar"
            translation="to speak"
            hasAudio
            cefrLevel="A1"
            metaBadge="-ar"
            description="Learn when and how to use o, a, os, as."
            footer={{ label: "Core Verb" }}
            onClick={() => {}}
          />
        </BlocoGrid>
      </section>
    </div>
  );
}

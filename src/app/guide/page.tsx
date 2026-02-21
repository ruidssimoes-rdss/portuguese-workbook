"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";

const sections = [
  {
    id: "how-aula-pt-works",
    number: 1,
    title: "How Aula PT Works",
    portuguese: "Como Funciona o Aula PT",
    teaser: "Everything the platform offers and how to use it.",
  },
  {
    id: "cefr-levels",
    number: 2,
    title: "Understanding CEFR Levels",
    portuguese: "Compreender os Níveis do QECR",
    teaser: "What A1, A2, and B1 actually mean in practice.",
  },
  {
    id: "timelines",
    number: 3,
    title: "Realistic Timelines",
    portuguese: "Prazos Realistas",
    teaser: "How long it takes and what to expect.",
  },
  {
    id: "daily-routine",
    number: 4,
    title: "Structuring Your Daily Routine",
    portuguese: "Estruturar a Tua Rotina Diária",
    teaser: "15, 30, and 60-minute daily plans.",
  },
  {
    id: "science-of-learning",
    number: 5,
    title: "The Science of Learning",
    portuguese: "A Ciência da Aprendizagem",
    teaser: "Active recall, spaced repetition, and what to avoid.",
  },
  {
    id: "portuguese-tips",
    number: 6,
    title: "Tips for Portuguese Specifically",
    portuguese: "Dicas para o Português",
    teaser: "Pronunciation, verbs, confusing pairs, immersion.",
  },
];

function GuideSectionContent({ id }: { id: string }) {
  switch (id) {
    case "how-aula-pt-works":
      return (
        <>
          <h2 className="text-[18px] font-semibold text-[#111827]">
            How Aula PT Works
          </h2>
          <p className="text-[13px] text-[#3C5E95]/70 font-medium mt-1">
            Como Funciona o Aula PT
          </p>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[#374151]">
            <p>
              Aula PT is designed as a learning companion, not a game. There are
              no streaks, no leaderboards, and no pressure to keep up with
              anyone else. You learn at your own pace, and the platform is there
              whenever you have time and energy to invest in your Portuguese.
            </p>

            <p className="font-semibold text-[#111827]">
              Your Daily Starting Point
            </p>
            <p>
              The homepage greets you with three simple anchors for your day: a
              Word of the Day, a Verb of the Day, and a Saying of the Day. These
              rotate every 24 hours and exist for one purpose — to make it easy
              to open Aula PT, learn something small, and keep your contact with
              Portuguese alive even on busy days.
            </p>

            <p>
              If you only have thirty seconds, reading those three items and
              listening to their pronunciation is enough to keep the habit
              going. On days when you have more time, they become a natural
              jumping-off point into vocabulary, grammar, culture, or practice.
            </p>

            <p className="font-semibold text-[#111827]">Learning Content</p>
            <p>
              Aula PT organises European Portuguese into four main areas, all
              accessible from the Learn menu. Each one plays a different role in
              your progress, and the magic comes from combining them rather than
              living in just one.
            </p>
            <p>
              In{" "}
              <span className="font-semibold text-[#111827]">Conjugations</span>{" "}
              you will find every verb laid out clearly across six key tenses.
              Each form is accompanied by a pronunciation guide and a natural
              example sentence, so you are never looking at dry tables in
              isolation. When verbs feel overwhelming, this is the calm,
              structured place to come back to.
            </p>
            <p>
              The{" "}
              <span className="font-semibold text-[#111827]">Vocabulary</span>{" "}
              section contains 676 words and phrases organised into 13
              real‑world categories such as Food &amp; Drink, Travel &amp;
              Directions, Health &amp; Body, and Home &amp; Rooms. Every entry
              has pronunciation, gender, an example sentence, and a CEFR level
              so you know whether it is beginner, elementary, or intermediate
              material.
            </p>
            <p>
              In the{" "}
              <span className="font-semibold text-[#111827]">Grammar</span>{" "}
              section you will find structured explanations of the rules that
              hold Portuguese together: articles and gender, pronouns, verb
              tenses, prepositions, and more. Each topic includes clear notes,
              examples, and short test questions so you can immediately check
              whether you have really understood the pattern.
            </p>
            <p>
              The{" "}
              <span className="font-semibold text-[#111827]">Culture</span>{" "}
              section focuses on what textbooks usually ignore: sayings and
              proverbs, false friends, etiquette, and regional slang. This is
              where you meet the language as it is actually used by Portuguese
              people, with nuance and humour, rather than as a list of
              artificially simple dialogues.
            </p>

            <p className="font-semibold text-[#111827]">Practice</p>
            <p>
              Practice in Aula PT starts with flashcards. You choose what to
              focus on – a specific vocabulary category, a CEFR level, the
              number of cards, the order, and the direction (Portuguese →
              English, English → Portuguese, or mixed). Each card invites you to
              pause, try to recall the answer, and then flip to see whether you
              were right.
            </p>
            <p>
              After flipping, you mark each card as{" "}
              <span className="font-semibold text-emerald-700">
                I knew it
              </span>{" "}
              or{" "}
              <span className="font-semibold text-amber-700">
                Still learning
              </span>
              . At the end of the session, Aula PT builds a focused review set
              of only the words you struggled with, so your next round of
              practice targets the weak spots instead of repeating everything
              equally.
            </p>

            <p className="font-semibold text-[#111827]">
              Progress, Tests, and Search
            </p>
            <p>
              As you work through conjugations, vocabulary, and grammar topics,
              progress tests help you see where you are on the A1–B1 scale. When
              you complete a section, you do not see the word “Failed” — you see
              “Not yet”. The difference is small on the screen but huge in your
              mindset: you are not bad at Portuguese, you are just not there yet.
            </p>
            <p>
              Whenever you are unsure where to go next, press{" "}
              <span className="font-mono text-xs text-[#6B7280]">⌘K</span> (or{" "}
              <span className="font-mono text-xs text-[#6B7280]">Ctrl+K</span>){" "}
              to open the smart search. You can ask natural questions like “How
              do you say kitchen?”, “Conjugate ir”, “Past tense of fazer”, or
              “What does saudade mean?” and jump straight to the relevant entry
              in vocabulary, conjugations, grammar, or culture.
            </p>
          </div>
        </>
      );
    case "cefr-levels":
      return (
        <>
          <h2 className="text-[18px] font-semibold text-[#111827]">
            Understanding CEFR Levels
          </h2>
          <p className="text-[13px] text-[#3C5E95]/70 font-medium mt-1">
            Compreender os Níveis do QECR
          </p>
          <p className="text-base text-[#374151] mt-4 leading-relaxed">
            CEFR (Common European Framework of Reference) is the international
            standard for describing language ability. Aula PT focuses on A1, A2,
            and B1 — the range that takes you from zero Portuguese to being able
            to live, work, and socialise in Portugal with real confidence.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-800">
                A1 — Beginner / Iniciante
              </p>
              <p className="text-sm text-[#374151] mt-2 leading-relaxed">
                At A1 you can handle basic survival situations. You can
                introduce yourself, ask very simple questions, order food and
                drinks, ask for directions, recognise common words on signs and
                menus, and take part in tiny exchanges as long as the other
                person speaks slowly and helps you.
              </p>
              <p className="text-sm text-[#374151] mt-2">
                You need roughly five hundred words and the core grammar of the
                present tense, articles, basic prepositions, and the essentials
                of <span className="font-semibold">ser</span> vs{" "}
                <span className="font-semibold">estar</span>.
              </p>
            </div>

            <div className="bg-cyan-50 border border-cyan-100 rounded-lg p-4">
              <p className="text-sm font-semibold text-violet-800">
                A2 — Elementary / Elementar
              </p>
              <p className="text-sm text-[#374151] mt-2 leading-relaxed">
                At A2 you can navigate daily life with growing confidence. You
                can describe your routine, family, and work, handle shopping and
                simple transactions, understand the main point of short texts
                and announcements, and talk about past events in straightforward
                sentences.
              </p>
              <p className="text-sm text-[#374151] mt-2">
                You need around a thousand words and grammar such as the past
                tenses (<span className="font-semibold">pretérito perfeito</span>{" "}
                and <span className="font-semibold">imperfeito</span>), future
                forms, object pronouns, and comparatives.
              </p>
            </div>

            <div className="bg-[#F9FAFB] border border-[#E9E9E9] rounded-lg p-4">
              <p className="text-sm font-semibold text-[#111827]">
                B1 — Intermediate / Intermédio
              </p>
              <p className="text-sm text-[#374151] mt-2 leading-relaxed">
                At B1 you can handle most situations that arise while travelling
                or living in Portugal. You follow and participate in
                conversations on familiar topics, understand the main points of
                TV programmes and news, write messages and short texts with some
                complexity, and express and justify your opinions.
              </p>
              <p className="text-sm text-[#374151] mt-2">
                You need roughly two thousand words and grammar such as basic
                subjunctive, conditional, relative pronouns, and more complex
                sentence patterns.
              </p>
            </div>
          </div>

          <p className="text-sm text-[#6B7280] mt-4 leading-relaxed">
            Aula PT currently covers A1 through B1 content. That is enough to
            understand most everyday Portuguese, talk to neighbours and
            colleagues, handle bureaucracy with some patience, and feel at home
            in the language rather than lost in it.
          </p>
        </>
      );
    case "timelines":
      return (
        <>
          <h2 className="text-[18px] font-semibold text-[#111827]">Realistic Timelines</h2>
          <p className="text-[13px] text-[#3C5E95]/70 font-medium mt-1">
            Prazos Realistas
          </p>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[#374151]">
            <p>
              Be honest with yourself about how long this takes. Language
              learning is a marathon, not a sprint. Portuguese is classified as
              a Category I language for English speakers — relatively close to
              English — but that still means hundreds of hours of exposure and
              practice.
            </p>
            <p>
              The numbers below are based on a mix of FSI estimates and
              experience from teachers and learners. They assume roughly thirty
              minutes of focused study per day plus some light immersion through
              listening and reading.
            </p>
          </div>

          <div className="mt-6 overflow-x-auto border border-[#F0F0F0] rounded-lg">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-[#F9FAFB]">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold text-[#6B7280]">
                    Level
                  </th>
                  <th className="text-left px-4 py-2 font-semibold text-[#6B7280]">
                    Hours of Study
                  </th>
                  <th className="text-left px-4 py-2 font-semibold text-[#6B7280]">
                    Realistic Calendar Time
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[#F0F0F0]">
                  <td className="px-4 py-2 font-semibold text-[#1F2937]">A1</td>
                  <td className="px-4 py-2 text-[#374151]">60–100 hours</td>
                  <td className="px-4 py-2 text-[#374151]">
                    2–3 months (about 30 minutes per day)
                  </td>
                </tr>
                <tr className="border-t border-[#F0F0F0] bg-[#F9FAFB]/40">
                  <td className="px-4 py-2 font-semibold text-[#1F2937]">A2</td>
                  <td className="px-4 py-2 text-[#374151]">150–200 hours</td>
                  <td className="px-4 py-2 text-[#374151]">
                    4–6 months (about 30 minutes per day)
                  </td>
                </tr>
                <tr className="border-t border-[#F0F0F0]">
                  <td className="px-4 py-2 font-semibold text-[#1F2937]">B1</td>
                  <td className="px-4 py-2 text-[#374151]">300–400 hours</td>
                  <td className="px-4 py-2 text-[#374151]">
                    8–14 months (about 30 minutes per day)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[#374151]">
            <p>
              These estimates assume fairly consistent daily practice. They may
              be shorter if you already speak another Romance language or have
              experience learning foreign languages. They may be longer if
              Portuguese is your first serious language or if your schedule is
              chaotic.
            </p>
            <p>
              The most important factor is not talent — it is consistency.
              Fifteen minutes every single day beats two hours once a week.
              Brains learn through regular, repeated exposure. Your job is not
              to be perfect; your job is to keep showing up.
            </p>
            <p>
              Do not compare yourself to other learners you see online. Some
              have more free time, easier access to native speakers, or years of
              prior language study. Your only benchmark is whether you know more
              Portuguese this month than you did last month.
            </p>
          </div>
        </>
      );
    case "daily-routine":
      return (
        <>
          <h2 className="text-[18px] font-semibold text-[#111827]">
            Structuring Your Daily Routine
          </h2>
          <p className="text-[13px] text-[#3C5E95]/70 font-medium mt-1">
            Estruturar a Tua Rotina Diária
          </p>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[#374151]">
            <p>
              A good routine does not need to be complicated. The goal is to
              attach Portuguese to things you already do — your morning coffee,
              your commute, the moment before you go to sleep. Once the habit is
              there, increasing the time is much easier.
            </p>
          </div>

          <div className="mt-6">
            <div className="bg-white border border-[#E9E9E9] rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-[#1F2937]">
                The 15-Minute Day (Minimum Effective Dose)
              </p>
              <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">
                For busy days when you are tempted to skip entirely. Fifteen
                minutes is enough to keep the connection to Portuguese alive.
              </p>
              <div className="mt-3 space-y-1.5 text-sm text-[#374151]">
                <p>
                  <span className="font-semibold text-[#111827]">5 min</span>{" "}
                  Open Aula PT and read the Word, Verb, and Saying of the Day.
                </p>
                <p>
                  <span className="font-semibold text-[#111827]">5 min</span> Do
                  a short flashcard session (around 10 cards) focused on words
                  you marked as &quot;still learning&quot;.
                </p>
                <p>
                  <span className="font-semibold text-[#111827]">5 min</span>{" "}
                  Read one grammar topic or one culture entry and say the
                  example sentences out loud.
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#E9E9E9] rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-[#1F2937]">
                The 30-Minute Day (Sweet Spot)
              </p>
              <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">
                This is the most sustainable routine for steady progress. It is
                long enough to make real gains but short enough to fit around a
                normal life.
              </p>
              <div className="mt-3 space-y-1.5 text-sm text-[#374151]">
                <p>
                  <span className="font-semibold text-[#111827]">5 min</span>{" "}
                  Check the daily word, verb, and saying.
                </p>
                <p>
                  <span className="font-semibold text-[#111827]">10 min</span>{" "}
                  Run a flashcard session with around 20 cards in mixed
                  direction.
                </p>
                <p>
                  <span className="font-semibold text-[#111827]">5 min</span>{" "}
                  Study one grammar topic and answer the test questions at the
                  end.
                </p>
                <p>
                  <span className="font-semibold text-[#111827]">5 min</span>{" "}
                  Read a few false friends or etiquette tips to deepen your
                  cultural understanding.
                </p>
                <p>
                  <span className="font-semibold text-[#111827]">5 min</span>{" "}
                  Listen to a short piece of Portuguese audio: a song, podcast
                  clip, or news headline.
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#E9E9E9] rounded-lg p-4">
              <p className="text-sm font-semibold text-[#1F2937]">
                The 60-Minute Day (Accelerated)
              </p>
              <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">
                Use this when you are motivated or have more free time. It is a
                powerful way to move through levels faster without burning out.
              </p>
              <div className="mt-3 space-y-1.5 text-sm text-[#374151]">
                <p>
                  <span className="font-semibold text-[#111827]">5 min</span>{" "}
                  Daily words and saying.
                </p>
                <p>
                  <span className="font-semibold text-[#111827]">15 min</span>{" "}
                  Flashcards (around 50 cards) focused on difficult items.
                </p>
                <p>
                  <span className="font-semibold text-[#111827]">10 min</span>{" "}
                  Study a grammar topic in depth and redo the questions until
                  you are confident.
                </p>
                <p>
                  <span className="font-semibold text-[#111827]">10 min</span>{" "}
                  Explore a vocabulary category you have not studied yet.
                </p>
                <p>
                  <span className="font-semibold text-[#111827]">10 min</span>{" "}
                  Write five original sentences using today&apos;s new words.
                </p>
                <p>
                  <span className="font-semibold text-[#111827]">10 min</span>{" "}
                  Watch or listen to native content — a YouTube video, series
                  episode, or podcast segment.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[#374151]">
            <p>
              Choose the routine that fits your current season of life. The
              fifteen‑minute version is not a &quot;failure day&quot;; it is the
              foundation that keeps your Portuguese alive until you can do
              more. As the language becomes more familiar and rewarding, you
              will naturally find yourself stretching into the longer versions.
            </p>
            <p>
              Over a week, you can keep things simple: from Monday to Friday,
              follow one of the daily plans above. On Saturday, spend a short
              session going back over the words you marked as &quot;still
              learning&quot;. On Sunday, give yourself an immersion day: watch a
              Portuguese film, cook a Portuguese recipe, or walk around town
              listening to Portuguese music.
            </p>
          </div>
        </>
      );
    case "science-of-learning":
      return (
        <>
          <h2 className="text-[18px] font-semibold text-[#111827]">
            Active Recall vs Passive Learning
          </h2>
          <p className="text-[13px] text-[#3C5E95]/70 font-medium mt-1">
            Recordação Ativa vs Aprendizagem Passiva
          </p>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[#374151]">
            <p>
              Understanding how your brain stores new information will make you
              far more efficient. Most learners spend a lot of time on
              activities that feel productive — reading lists, highlighting
              texts, re‑watching videos — but do very little to build strong,
              usable memories.
            </p>
            <p>
              When you simply read a vocabulary list again and again, your brain
              recognises the words. Recognition feels familiar and safe, so you
              assume you are learning. But being able to recognise &quot;cozinha&quot;
              on a page is very different from being able to answer &quot;How do
              you say kitchen?&quot; in real time.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-5">
              <p className="text-sm font-semibold text-emerald-800">
                Active Recall
              </p>
              <p className="text-sm text-[#374151] mt-2 leading-relaxed">
                Active recall means deliberately trying to remember something
                before you look at the answer. Each time you do this, you
                strengthen the pathways in your brain that store that piece of
                information. Even when you fail, the act of trying makes the
                next exposure more effective.
              </p>
              <p className="text-sm text-[#374151] mt-2 leading-relaxed">
                Flashcards are powerful because of the moment of effort just
                before you flip the card. The same is true when you pause a
                video and try to repeat what you heard, or when you cover the
                translation of the Word of the Day and see if you can recall it
                first.
              </p>
              <p className="text-sm text-[#374151] mt-2 leading-relaxed">
                In Aula PT, lean into English → Portuguese flashcards, say the
                answer out loud before revealing it, and take grammar tests
                before you feel &quot;ready&quot;. Struggle is not a sign that you are
                failing — it is the engine that drives learning.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
              <p className="text-sm font-semibold text-blue-800">
                Spaced Repetition
              </p>
              <p className="text-sm text-[#374151] mt-2 leading-relaxed">
                Your memory follows a forgetting curve: new material fades
                quickly at first, then more slowly over time. The most efficient
                moment to review something is right before you would forget it,
                not immediately afterwards and not months later.
              </p>
              <p className="text-sm text-[#374151] mt-2 leading-relaxed">
                In practice, this means revisiting new words the same day you
                learn them, again the next day, then after a few days, then a
                week, then a month. Each well‑timed review flattens the
                forgetting curve.
              </p>
              <p className="text-sm text-[#374151] mt-2 leading-relaxed">
                The flashcard session summary in Aula PT already nudges you in
                this direction: when you tap &quot;Practice these again&quot;, you get a
                focused set of items that your brain has flagged as fragile.
                Building a habit of revisiting those sets over time gives you a
                simple, practical form of spaced repetition.
              </p>
            </div>
          </div>

          <div className="mt-6 bg-red-50 border border-red-100 rounded-lg p-5">
            <p className="text-sm font-semibold text-red-700">
              What to Avoid
            </p>
            <p className="text-sm text-[#374151] mt-2 leading-relaxed">
              Purely passive activities feel comfortable but do not move you
              forward very quickly. Reading vocabulary lists without ever
              testing yourself, watching TV in Portuguese while scrolling on
              your phone, or re‑reading grammar explanations without applying
              them in sentences all create a pleasant illusion of progress.
            </p>
            <p className="text-sm text-[#374151] mt-2 leading-relaxed">
              A simple rule of thumb is this: if it feels completely easy, you
              are probably not learning very much. Lean gently into tasks that
              make you think and that you occasionally get wrong. That is where
              the real growth happens.
            </p>
          </div>
        </>
      );
    case "portuguese-tips":
      return (
        <>
          <h2 className="text-[18px] font-semibold text-[#111827]">
            Tips for Portuguese Specifically
          </h2>
          <p className="text-[13px] text-[#3C5E95]/70 font-medium mt-1">
            Dicas para o Português
          </p>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[#374151]">
            <p className="font-semibold text-[#111827]">
              Pronunciation is Your Biggest Challenge
            </p>
            <p>
              European Portuguese has a reputation for being &quot;the mumbled
              cousin&quot; of the Romance languages. That reputation comes from its
              pronunciation: reduced vowels, nasal sounds, and consonant clusters
              that do not match how the words look on the page.
            </p>
            <p>
              The good news is that this is a physical skill as much as a mental
              one. Your mouth, tongue, and jaw need new movements, and those
              are trained through repetition, not through reading rules.
            </p>
            <p>
              Pay particular attention to unstressed vowels:{" "}
              <span className="font-semibold">o</span> often sounds like &quot;oo&quot;,
              and <span className="font-semibold">e</span> can almost disappear.
              Word‑final <span className="font-semibold">s</span> often sounds
              like &quot;sh&quot; ({'"'}português{'"'} → poor‑too‑GESH),{" "}
              <span className="font-semibold">lh</span> sounds like the &quot;lli&quot;
              in &quot;million&quot; ({'"'}trabalho{'"'} → truh‑BAH‑lyoo), and{" "}
              <span className="font-semibold">nh</span> is the &quot;ny&quot; sound
              in &quot;canyon&quot; ({'"'}amanhã{'"'} → uh‑mah‑NYAH).
            </p>
            <p>
              Use the pronunciation buttons throughout Aula PT. Say the word out
              loud, not just in your head, and do not be afraid to exaggerate
              the sounds at first. You are teaching your muscles a new pattern.
            </p>

            <p className="font-semibold text-[#111827] mt-4">
              The Verb Problem
            </p>
            <p>
              Portuguese verbs can feel intimidating: six persons multiplied by
              several tenses means dozens of forms per verb. The key is to
              accept that you do not need all of them immediately.
            </p>
            <p>
              Start by mastering{" "}
              <span className="font-semibold">Presente</span> and{" "}
              <span className="font-semibold">Pretérito Perfeito</span>. Those
              two tenses let you talk about what you do and what you did — a
              huge percentage of everyday conversation. Once they feel solid,
              you can layer in the{" "}
              <span className="font-semibold">Pretérito Imperfeito</span> for
              background descriptions, then future forms and conditionals, and
              finally the subjunctive at B1.
            </p>
            <p>
              When looking at conjugation tables in Aula PT, resist the urge to
              memorise everything at once. Focus instead on accuracy with the
              most common persons (eu, tu, ele/ela, nós) in the most common
              tenses, and let the rest grow over time.
            </p>

            <p className="font-semibold text-[#111827] mt-4">
              Confusing Pairs to Watch
            </p>
            <p>
              Every language has traps, and Portuguese is no exception. The
              classic one is <span className="font-semibold">ser</span> vs{" "}
              <span className="font-semibold">estar</span>. A simple rule:
              things that define you or are unlikely to change soon use{" "}
              <span className="font-semibold">ser</span> (sou português, sou
              engenheiro). Temporary states and locations use{" "}
              <span className="font-semibold">estar</span> (estou cansado, estou
              em casa).
            </p>
            <p>
              Other pairs to keep an eye on are{" "}
              <span className="font-semibold">saber</span> vs{" "}
              <span className="font-semibold">conhecer</span> (to know facts vs
              to be familiar with people or places),{" "}
              <span className="font-semibold">por</span> vs{" "}
              <span className="font-semibold">para</span>, and{" "}
              <span className="font-semibold">ir</span> vs{" "}
              <span className="font-semibold">vir</span>. The grammar section in
              Aula PT has dedicated topics for these — use them, then notice the
              same patterns appearing in vocabulary examples and culture
              entries.
            </p>

            <p className="font-semibold text-[#111827] mt-4">
              Building Immersion from Home
            </p>
            <p>
              You do not need to live in Lisbon or Porto to surround yourself
              with Portuguese. You can change your phone&apos;s language,
              follow Portuguese creators on social media, listen to local radio
              stations, and watch series with Portuguese subtitles.
            </p>
            <p>
              The goal is not to understand every word from day one. The goal is
              to make the sound and rhythm of Portuguese feel normal in your
              brain. First you catch isolated words, then short phrases, then
              whole sentences, and one day you realise you just understood a
              full conversation without translating it in your head.
            </p>
          </div>
        </>
      );
    default:
      return null;
  }
}

export default function GuidePage() {
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setOpenSectionId((prev) => (prev === id ? null : id));
  }, []);

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    if (hash && sections.some((s) => s.id === hash)) {
      setOpenSectionId(hash);
    }
  }, []);

  useEffect(() => {
    if (!openSectionId) return;
    const el = document.getElementById(openSectionId);
    if (el) {
      const t = setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
      return () => clearTimeout(t);
    }
  }, [openSectionId]);

  return (
    <>
      <Topbar />
      <main className="max-w-[896px] mx-auto px-4 md:px-6 lg:px-10 py-5">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            How to Learn Portuguese
          </h1>
          <p className="text-[13px] text-[#3C5E95] font-medium mt-1">
            Como Aprender Português
          </p>
          <p className="text-[13px] text-text-3 mt-2 max-w-xl leading-relaxed">
            Your complete guide to learning European Portuguese — from your first
            words to real conversations, using Aula PT as your main companion.
          </p>
        </header>

        <div className="space-y-3">
          {sections.map((s) => {
            const isOpen = openSectionId === s.id;
            return (
              <article
                key={s.id}
                id={s.id}
                className={`bg-white border rounded-[14px] cursor-pointer transition-all min-h-[44px] ${
                  isOpen ? "border-[#3C5E95]/30" : "border-[#E5E5E5]"
                } hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]`}
              >
                <button
                  type="button"
                  onClick={() => toggle(s.id)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4"
                  aria-expanded={isOpen}
                  aria-controls={`${s.id}-content`}
                  id={`${s.id}-button`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-[#111827]">
                      <span className="text-sm text-[#D1D5DB] font-medium">{s.number}.</span> {s.title}
                    </p>
                    <p className="text-sm text-[#3C5E95]/60 font-medium mt-0.5">
                      {s.portuguese}
                    </p>
                    {!isOpen && (
                      <p className="text-sm text-[#9CA3AF] mt-1">{s.teaser}</p>
                    )}
                  </div>
                  <svg
                    className={`flex-shrink-0 text-[#D1D5DB] w-5 h-5 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <div
                  id={`${s.id}-content`}
                  role="region"
                  aria-labelledby={`${s.id}-button`}
                  className={`accordion-content ${isOpen ? "open" : ""}`}
                >
                  <div>
                    <div className="border-t border-[#F0F0F0] mt-4 pt-6 px-6 pb-6 text-[15px] leading-relaxed text-[#374151]">
                      <GuideSectionContent id={s.id} />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <section className="pb-8 mb-4 text-center mt-12 pt-4">
          <p className="text-[15px] font-medium text-[#111827]">
            You&apos;re ready.
          </p>
          <p className="text-[15px] text-[#6B7280] mt-2">
            The best time to start was yesterday. The second best time is now.
            Open any section in the Learn menu and begin.
          </p>
          <p className="text-[15px] text-[#3C5E95] italic mt-4">
            A língua portuguesa está à tua espera.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/vocabulary"
              className="bg-[#111827] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#1F2937] transition-colors min-w-[190px] text-center"
            >
              Start with Vocabulary →
            </Link>
            <Link
              href="/practice/flashcards"
              className="border border-[#3C5E95] text-[#3C5E95] px-6 py-3 rounded-lg text-sm font-medium hover:bg-sky-50 transition-colors min-w-[190px] text-center"
            >
              Try Flashcards →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}


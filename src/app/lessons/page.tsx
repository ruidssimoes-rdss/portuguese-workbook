"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, ArrowRight, RotateCcw, ChevronDown } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getFullProgression } from "@/lib/learning-engine/cefr-readiness";
import { getReviewCount, type CEFRProgress } from "@/lib/learning-engine/mastery-tracker";
import { createClient } from "@/lib/supabase/client";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/primitives";

// ─── Types ──────────────────────────────────────────────

interface LevelProgression {
  progress: CEFRProgress;
  unlocked: boolean;
}

// ─── How it works (collapsible) ─────────────────────────

function HowItWorks() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-[#F7F7F5] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg px-5 py-3.5 hover:border-[rgba(0,0,0,0.12)] transition-colors cursor-pointer"
      >
        <div>
          <p className="text-[13px] font-medium text-[#111111] text-left">
            Como funcionam as lições
          </p>
          <p className="text-[11px] text-[#9B9DA3] text-left">
            How lessons work
          </p>
        </div>
        <ChevronDown
          size={16}
          className={`text-[#9B9DA3] transition-transform duration-150 shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="mt-2 bg-[#F7F7F5] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg px-5 py-4 space-y-3 text-[13px] text-[#6C6B71] leading-relaxed">
          <p>Each lesson is generated for you based on what you need to learn next. No two lessons are the same.</p>
          <p>Every lesson includes:</p>
          <ul className="space-y-1.5 ml-1">
            <li className="flex gap-2"><span className="text-[#9B9DA3]">·</span> New vocabulary, verbs, and grammar to learn</li>
            <li className="flex gap-2"><span className="text-[#9B9DA3]">·</span> Practice exercises on what you just learned</li>
            <li className="flex gap-2"><span className="text-[#9B9DA3]">·</span> Review of things you&apos;ve seen before</li>
            <li className="flex gap-2"><span className="text-[#9B9DA3]">·</span> Spot-checks on content you&apos;ve already mastered</li>
          </ul>
          <p>
            You need <span className="font-medium text-[#111111]">80%</span> to pass each lesson.
            As you master more content, the next CEFR level unlocks at <span className="font-medium text-[#111111]">75%</span> readiness.
          </p>
          <p>
            Use <span className="font-medium text-[#111111]">Review</span> to revisit items you&apos;re struggling with — the system tracks what needs attention.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── CEFR Level Card ────────────────────────────────────

function CEFRLevelCard({
  level,
  label,
  labelPt,
  progress,
  unlocked,
  reviewCount,
}: {
  level: string;
  label: string;
  labelPt: string;
  progress: CEFRProgress;
  unlocked: boolean;
  reviewCount: number;
}) {
  const readinessPct = Math.round(progress.readiness * 100);

  if (!unlocked) {
    return (
      <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-6 opacity-60">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[16px] font-medium text-[#111111]">
            {level} — {label}
            <span className="text-[#9B9DA3] font-normal ml-2">{labelPt}</span>
          </h2>
          <Lock size={16} className="text-[#9B9DA3]" />
        </div>
        <p className="text-[13px] text-[#9B9DA3]">
          Complete 75% of {level === "A2" ? "A1" : "A2"} to unlock
        </p>
      </div>
    );
  }

  return (
    <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-medium text-[#111111]">
          {level} — {label}
          <span className="text-[#9B9DA3] font-normal ml-2">{labelPt}</span>
        </h2>
        <span className="text-[22px] font-medium text-[#111111]">{readinessPct}%</span>
      </div>

      <div className="h-2 bg-[rgba(0,0,0,0.06)] rounded-full mb-4">
        <div
          className="h-2 bg-[#185FA5] rounded-full transition-all duration-500"
          style={{ width: `${readinessPct}%` }}
        />
      </div>

      <div className="flex gap-6 mb-4">
        <div>
          <div className="text-[11px] text-[#9B9DA3] uppercase tracking-[0.05em]">Items</div>
          <div className="text-[14px] font-medium text-[#111111]">{progress.totalItems}</div>
        </div>
        <div>
          <div className="text-[11px] text-[#9B9DA3] uppercase tracking-[0.05em]">Mastered</div>
          <div className="text-[14px] font-medium text-[#0F6E56]">{progress.mastered}</div>
        </div>
        <div>
          <div className="text-[11px] text-[#9B9DA3] uppercase tracking-[0.05em]">In progress</div>
          <div className="text-[14px] font-medium text-[#854F0B]">{progress.familiar + progress.introduced}</div>
        </div>
        <div>
          <div className="text-[11px] text-[#9B9DA3] uppercase tracking-[0.05em]">Unseen</div>
          <div className="text-[14px] font-medium text-[#9B9DA3]">{progress.unseen}</div>
        </div>
      </div>

      <div className="space-y-1.5 mb-5">
        <SkillBar label="Vocab" value={progress.vocabProgress} />
        <SkillBar label="Verbs" value={progress.verbProgress} />
        <SkillBar label="Grammar" value={progress.grammarProgress} />
      </div>

      <div className="flex gap-3">
        <Link
          href="/lessons/next"
          className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-white bg-[#111111] rounded-lg hover:bg-[#333] transition-colors"
        >
          Start next lesson
          <ArrowRight size={14} />
        </Link>

        {reviewCount > 0 && (
          <Link
            href="/lessons/review"
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-[#6C6B71] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg hover:border-[rgba(0,0,0,0.12)] transition-colors"
          >
            <RotateCcw size={14} />
            Review {reviewCount} items
          </Link>
        )}
      </div>
    </div>
  );
}

function SkillBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-[#9B9DA3] w-14">{label}</span>
      <div className="flex-1 h-1 bg-[rgba(0,0,0,0.06)] rounded-full">
        <div
          className="h-1 bg-[#185FA5] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-[#9B9DA3] w-8 text-right">{pct}%</span>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────

export default function LessonsPage() {
  const { user, loading: authLoading } = useAuth();
  const [progression, setProgression] = useState<{
    a1: LevelProgression;
    a2: LevelProgression;
    b1: LevelProgression;
  } | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) { setLoading(false); return; }

      const prog = await getFullProgression(currentUser.id);
      setProgression(prog);

      const count = await getReviewCount(currentUser.id);
      setReviewCount(count);

      setLoading(false);
    }
    load();
  }, []);

  const isLoggedIn = !authLoading && !!user;

  return (
    <PageShell>
      <PageHeader
        title="Lições"
        subtitle="Your personalised learning journey"
      />

      <HowItWorks />

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-[13px] text-[#9B9DA3]">A carregar o progresso...</div>
        </div>
      ) : progression ? (
        <div className="space-y-4">
          <CEFRLevelCard
            level="A1"
            label="Beginner"
            labelPt="Iniciante"
            progress={progression.a1.progress}
            unlocked={progression.a1.unlocked}
            reviewCount={reviewCount}
          />
          <CEFRLevelCard
            level="A2"
            label="Elementary"
            labelPt="Elementar"
            progress={progression.a2.progress}
            unlocked={progression.a2.unlocked}
            reviewCount={0}
          />
          <CEFRLevelCard
            level="B1"
            label="Intermediate"
            labelPt="Intermédio"
            progress={progression.b1.progress}
            unlocked={progression.b1.unlocked}
            reviewCount={0}
          />
        </div>
      ) : (
        <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-8 text-center">
          <p className="text-[14px] font-medium text-[#111111]">
            Sign in to start learning
          </p>
          <p className="text-[12px] text-[#9B9DA3] mt-1">
            Inicia sessão para começar a aprender
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-4 py-2 bg-[#111111] text-white rounded-lg text-[13px] font-medium hover:bg-[#333] transition-colors mt-4"
          >
            Entrar
          </Link>
        </div>
      )}
    </PageShell>
  );
}

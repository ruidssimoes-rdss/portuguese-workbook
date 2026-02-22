import { Topbar } from "@/components/layout/topbar";

export const metadata = {
  title: "CIPLE Mock Exams — Aula PT",
};

export default function ExamsPage() {
  return (
    <>
      <Topbar />
      <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
        <div className="py-5">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold text-[#111827]">
              CIPLE Mock Exams
            </h1>
            <span className="text-[13px] font-medium text-[#9CA3AF] italic">
              Exames de Preparação CIPLE
            </span>
          </div>
          <p className="mt-1 text-[13px] text-[#9CA3AF]">
            Monthly mock exams to prepare for the CIPLE A2 certification. New
            exams released each month.
          </p>
          <div className="border-t border-[#F3F4F6] mt-4 mb-6" />
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-6">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <p className="text-[18px] font-semibold text-[#111827]">
            First exam coming soon
          </p>
          <p className="text-[13px] text-[#9CA3AF] mt-1">March 2026</p>
          <p className="text-[13px] text-[#6B7280] mt-4 max-w-md leading-relaxed">
            Each mock exam will simulate the full CIPLE A2 test format —
            reading comprehension, written production, oral comprehension, and
            oral production — so you can track your readiness over time.
          </p>
        </div>
      </main>
    </>
  );
}

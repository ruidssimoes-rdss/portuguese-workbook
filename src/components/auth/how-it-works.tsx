import { Info } from "lucide-react";

const LEVELS = [
  {
    level: "A1",
    title: "Parte I · Iniciação",
    copy: "Apresentas-te, pedes um café, dizes as horas e os números.",
    badge: "bg-[#E1F2ED] text-[#1F7A68]",
  },
  {
    level: "A2",
    title: "Parte II · Sobreviver no dia a dia",
    copy: "Contas o que fizeste ontem e como era antes. Tratas de compras, médico, farmácia.",
    badge: "bg-[#E8ECF6] text-[#1B2B61]",
  },
  {
    level: "B1",
    title: "Parte III · Conversar à vontade",
    copy: "Dás a tua opinião e justificas. Contas uma história inteira.",
    badge: "bg-[#E8ECF6] text-[#1B2B61]",
  },
];

/** Left half of the auth card, from 744px up. Hidden below that. */
export function HowItWorks() {
  return (
    <aside className="hidden min-h-0 flex-col justify-center bg-[#F7F7F6] px-8 py-8 min-[744px]:flex">
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A5A57]">Como funciona o Aula</p>
      <h2 className="mt-3 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-[#1F1F1F]">
        Três níveis, do primeiro «olá» a conversar sem pensar.
      </h2>
      <p className="mt-2 text-[13px] text-[#5A5A57]">Um pouco todos os dias chega.</p>

      <div className="mt-6 flex flex-col gap-3">
        {LEVELS.map((level) => (
          <div key={level.level} className="rounded-xl border border-[#E6E6E4] bg-white px-4 py-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex h-5 items-center rounded-md px-2 text-[11px] font-semibold ${level.badge}`}>
                {level.level}
              </span>
              <span className="text-[13px] font-medium text-[#1F1F1F]">{level.title}</span>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-[#5A5A57]">{level.copy}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-2 text-[11px] text-[#5A5A57]">
          <span>Por ver</span>
          <span className="flex h-1 flex-1 gap-1" aria-hidden>
            <span className="h-1 flex-1 rounded-full bg-[#E6E6E4]" />
            <span className="h-1 flex-1 rounded-full bg-[#C5CDE0]" />
            <span className="h-1 flex-1 rounded-full bg-[#1B2B61]" />
            <span className="h-1 flex-1 rounded-full bg-[#1F7A68]" />
          </span>
          <span>Dominado</span>
        </div>
        <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-[#5A5A57]">
          <Info size={12} strokeWidth={1.75} className="mt-0.5 shrink-0" aria-hidden />
          <span>Os níveis seguem o Quadro Europeu Comum de Referência (QECR).</span>
        </p>
      </div>
    </aside>
  );
}

import type { Metadata } from "next";
import { MarketingFrame } from "@/components/marketing/frame";

export const metadata: Metadata = {
  title: "Privacidade — Aula",
  description:
    "O que a Aula guarda numa conta de português europeu: perfil, progresso, notas e calendário. Sem lista de espera.",
  openGraph: {
    title: "Privacidade — Aula",
    description:
      "O que a Aula guarda numa conta: perfil, progresso, notas e calendário. Sem lista de espera.",
    locale: "pt_PT",
    type: "website",
    siteName: "Aula",
  },
};

export default function PrivacyPage() {
  return (
    <MarketingFrame>
      <article className="mx-auto w-full max-w-[720px] px-4 py-8 min-[744px]:px-8 min-[744px]:py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A5A57]">Privacidade</p>
        <h1 className="mt-4 text-balance text-[32px] font-semibold leading-tight tracking-[-0.03em] min-[744px]:text-[40px]">
          A conta serve o curso. Não há lista de espera.
        </h1>
        <p className="mt-5 text-pretty text-[16px] leading-[1.6] text-[#5A5A57]">
          A Aula guarda o que precisas para continuar de onde ficaste. Não pedimos cartão, não vendemos dados e não há uma lista de correio.
        </p>
        <p className="mt-3 text-[13px] text-[#5A5A57]">Última atualização: 24 de outubro de 2026.</p>

        <Section title="Conta">
          Email e palavra-passe, ou a conta Google se entrares por aí, e o nome que escreves. A palavra-passe fica no serviço de autenticação. A Aula não a lê.
        </Section>
        <Section title="O início">
          No onboarding podes dizer porque aprendes, o nível em que te vês, quantos dias queres estudar, o objetivo e uma data. Podes saltar e alterar isto depois, em Definições.
        </Section>
        <Section title="Progresso, notas e calendário">
          Lições feitas, domínio de palavras, verbos e regras, datas de revisão, sequência de dias, resultados do simulado, notas, eventos, objetivos e preferências de estudo.
        </Section>
        <Section title="O Professor Elísio">
          O Elísio monta a sessão a partir do teu progresso e do texto do curso. Nada disso vai para um modelo pago. A sessão fica na tua conta. A nota à margem de um capítulo responde com o passo que estás a ler e não é gravada.
        </Section>
        <Section title="Áudio">
          Os clips de pronúncia são conteúdo do curso, em pt-PT. Não são gravações tuas.
        </Section>
        <Section title="Onde ficam os dados">
          A sessão e a base de dados estão no Supabase. A aplicação corre na Vercel. A Vercel Analytics e o Speed Insights medem a utilização do site, sem publicidade e sem uma lista de correio.
        </Section>
        <Section title="Sem conta">
          Vocabulário, gramática, conjugações, cultura, os índices de lições e de exames, e esta página, abrem sem sessão. Abrir uma lição ou fazer o simulado pede conta.
        </Section>
        <Section title="Exportar e sair">
          Em Definições podes exportar um ficheiro JSON com o perfil, o progresso das lições, as notas, o calendário e os objetivos. Também podes sair da conta. A sessão usa um cookie. Há outro cookie, curto, só para o regresso depois de entrares com o Google.
        </Section>
      </article>
    </MarketingFrame>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-[#1F1F1F]">{title}</h2>
      <p className="mt-2 text-pretty text-[15px] leading-[1.6] text-[#5A5A57]">{children}</p>
    </section>
  );
}

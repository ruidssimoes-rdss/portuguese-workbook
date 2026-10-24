import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { MarketingFrame } from "@/components/marketing/frame";
import { formatCount, libraryCounts } from "@/lib/library-counts";

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B2B61]";

const primaryCta = `inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#1B2B61] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#14214C] ${focus}`;
const secondaryCta = `inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E6E6E4] bg-white px-5 text-[14px] font-medium text-[#1F1F1F] transition-colors hover:bg-[#F7F7F6] ${focus}`;

const counts = libraryCounts;
const grammarSplit =
  counts.grammarByLevel.A1 > 0 &&
  counts.grammarByLevel.A1 === counts.grammarByLevel.A2 &&
  counts.grammarByLevel.A2 === counts.grammarByLevel.B1;

const tenseLine = counts.hasCoreTenses
  ? `${formatCount(counts.tenses)} tempos, do presente ao futuro do conjuntivo, e o imperativo`
  : `${formatCount(counts.tenses)} tempos`;

export function Landing() {
  return (
    <MarketingFrame>
      <section id="inicio" className="scroll-mt-20 mx-auto grid w-full max-w-[1120px] items-center gap-10 px-4 pb-16 pt-6 min-[744px]:min-h-[calc(100dvh-5rem)] min-[744px]:px-8 min-[744px]:py-12 min-[1100px]:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] min-[1100px]:gap-16">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A5A57]">Português europeu</p>
          <h1 className="mt-4 text-balance text-[36px] font-semibold leading-[1.08] tracking-[-0.03em] min-[744px]:max-w-[12em] min-[744px]:text-[52px]">
            O português de Portugal, do A1 ao B1.
          </h1>
          <p className="mt-5 max-w-[44ch] text-pretty text-[16px] leading-[1.6] text-[#5A5A57] min-[744px]:text-[17px]">
            A Aula é um curso de português europeu: vocabulário, gramática, conjugações e cultura de Portugal.
            {" "}
            {formatCount(counts.lessons)} lições, revisão que volta na hora certa, e uma conta — não uma lista de espera.
          </p>
          <div className="mt-8 flex flex-col gap-3 min-[744px]:flex-row min-[744px]:items-center">
            <Link href="/auth/signup" className={`${primaryCta} w-full min-[744px]:w-auto`}>
              Criar conta
              <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
            </Link>
            <Link href="/auth/login" className={`${secondaryCta} w-full min-[744px]:w-auto`}>
              Entrar
            </Link>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-[#5A5A57]">
            Email ou Google. Sem lista de espera.
          </p>
        </div>

        <aside aria-label="A biblioteca" className="min-w-0 rounded-2xl border border-[#E6E6E4] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] min-[744px]:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A5A57]">Biblioteca</p>
          <p className="mt-2 text-[15px] font-medium tracking-[-0.01em] text-[#1F1F1F]">
            Números desta versão do curso.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Stat href="/vocabulary" value={formatCount(counts.words)} label="palavras" detail={`${formatCount(counts.themes)} temas`} />
            <Stat href="/conjugations" value={formatCount(counts.verbs)} label="verbos" detail={`${formatCount(counts.tenses)} tempos, do presente ao imperativo`} />
            <Stat
              href="/grammar"
              value={formatCount(counts.grammarTopics)}
              label="tópicos de gramática"
              detail={grammarSplit ? `${formatCount(counts.grammarByLevel.A1)} em cada nível, de A1 a B1` : "A1, A2 e B1"}
            />
            <Stat
              href="/culture"
              value={formatCount(counts.culture)}
              label="notas de cultura"
              detail={
                <>
                  {formatCount(counts.sayings)} ditados · {formatCount(counts.falseFriends)} falsos amigos
                  <br />
                  {formatCount(counts.etiquette)} de etiqueta · {formatCount(counts.regional)} regionais
                </>
              }
            />
          </div>
        </aside>
      </section>

      <section id="diferencas" className="scroll-mt-20 mx-auto w-full max-w-[1120px] px-4 py-4 min-[744px]:px-8 min-[744px]:py-8">
        <div className="max-w-[40rem]">
          <h2 className="text-balance text-[28px] font-semibold leading-tight tracking-[-0.02em] min-[744px]:text-[32px]">
            O que a Aula é, hoje.
          </h2>
          <p className="mt-3 text-pretty text-[15px] leading-[1.6] text-[#5A5A57]">
            Quatro coisas que já estão no curso. Nada disto é uma lista de intenções.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 min-[744px]:grid-cols-2">
          <Card
            title="Português de Portugal"
            body="«Autocarro», não «ônibus». «Estou a fazer», não «estou fazendo». O tu no dia a dia. O áudio é pt-PT."
          />
          <Card
            title="Biblioteca de referência"
            body={`${formatCount(counts.words)} palavras, ${formatCount(counts.grammarTopics)} tópicos de gramática e ${formatCount(counts.verbs)} verbos, com ${tenseLine}.`}
          />
          <Card
            title="Percurso até ao CIPLE e ao DEPLE"
            body={`${formatCount(counts.lessons)} lições: ${formatCount(counts.lessonsA1)} de A1, ${formatCount(counts.lessonsA2)} de A2 e ${formatCount(counts.lessonsB1)} de B1. No fim do A2 está o CIPLE. No fim do B1, o DEPLE. Há um simulado no formato do CIPLE.`}
          />
          <Card
            title="Revisão espaçada, e o Professor Elísio"
            body="Cada palavra, verbo e regra fica com uma data. Acertas e o intervalo cresce. Erras e a revisão volta no dia seguinte. O Elísio prepara uma sessão e responde com o texto do curso. Não é um chat pago, nem um modelo de fora."
          />
        </div>
      </section>

      <section id="percurso" className="scroll-mt-20 mx-auto w-full max-w-[1120px] px-4 py-12 min-[744px]:px-8 min-[744px]:py-16">
        <div className="max-w-[40rem]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A5A57]">O percurso</p>
          <h2 className="mt-3 text-balance text-[28px] font-semibold leading-tight tracking-[-0.02em] min-[744px]:text-[32px]">
            Três níveis. Um pouco todos os dias chega.
          </h2>
          <p className="mt-3 text-pretty text-[15px] leading-[1.6] text-[#5A5A57]">
            Os níveis seguem o Quadro Europeu Comum de Referência. O nível seguinte abre quando estás 75% pronto no atual.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 min-[1100px]:grid-cols-3">
          <Level
            level="A1"
            name="Iniciação"
            lessons={`${formatCount(counts.lessonsA1)} lições`}
            tone="teal"
            body="Apresentas-te, pedes um café, dizes as horas e os números."
          />
          <Level
            level="A2"
            name="Sobreviver no dia a dia"
            lessons={`${formatCount(counts.lessonsA2)} lições`}
            exam="CIPLE, o exame oficial de A2"
            tone="navy"
            body="Contas o que fizeste ontem. Tratas de compras, médico e farmácia."
          />
          <Level
            level="B1"
            name="Conversar à vontade"
            lessons={`${formatCount(counts.lessonsB1)} lições`}
            exam="DEPLE, o exame oficial de B1"
            tone="navy"
            body="Dás a tua opinião e justificas. Contas uma história inteira."
          />
        </div>
      </section>

      <section id="como" className="scroll-mt-20 mx-auto w-full max-w-[1120px] px-4 py-4 min-[744px]:px-8 min-[744px]:py-8">
        <div className="max-w-[40rem]">
          <h2 className="text-balance text-[28px] font-semibold leading-tight tracking-[-0.02em] min-[744px]:text-[32px]">
            Como se entra, e como se estuda.
          </h2>
        </div>
        <ol className="mt-8 grid list-none grid-cols-1 gap-4 p-0 min-[1100px]:grid-cols-3">
          <Step
            n="01"
            title="Crias a conta"
            body="Email e palavra-passe, ou Google. Se o registo pedir confirmação, o link chega ao email. Depois dizes porque aprendes, o nível e o ritmo."
          />
          <Step
            n="02"
            title="Estudas"
            body="Uma lição do percurso, ou a biblioteca: palavras, regras, verbos, cultura. A sessão de prática junta o que ainda te falta."
          />
          <Step
            n="03"
            title="Revês"
            body="O que está na hora volta sozinho. As palavras e os verbos mais comuns voltam mais cedo. O Elísio escreve a nota a partir do passo em que estás."
          />
        </ol>
      </section>

      <section id="perguntas" className="scroll-mt-20 mx-auto w-full max-w-[1120px] px-4 py-12 min-[744px]:px-8 min-[744px]:py-16">
        <h2 className="text-[28px] font-semibold tracking-[-0.02em] min-[744px]:text-[32px]">Perguntas</h2>
        <div className="mt-8 flex max-w-[720px] flex-col gap-3">
          <Faq
            q="Isto é português do Brasil?"
            a="Não. O vocabulário, a gramática, o uso e o áudio são de Portugal."
          />
          <Faq
            q="O Professor Elísio é um chat de inteligência artificial?"
            a="Não. Prepara uma sessão com o que já estudaste e responde com o texto do curso. Não há modelo pago, nem um parceiro de conversa."
          />
          <Faq
            q="Há uma aplicação para o telemóvel?"
            a="Não. A Aula abre no browser. Não há aplicação para instalar."
          />
          <Faq
            q="Tenho de entrar numa lista de espera?"
            a="Não. Criar conta abre o registo. Confirmas o email, ou entras com o Google, e segues para o início."
          />
          <Faq
            q="Posso ver a biblioteca sem conta?"
            a="Sim. O vocabulário, a gramática, as conjugações, a cultura, os índices de lições e de exames, e o guia abrem sem conta. Abrir uma lição, fazer o simulado, a prática e o Elísio pedem sessão."
          />
          <Faq
            q="Há exame do DEPLE dentro da Aula?"
            a="O percurso de B1 aponta para o DEPLE. O simulado que podes fazer hoje segue o formato do CIPLE. Os outros exames da lista ainda estão por abrir."
          />
        </div>
      </section>

      <section id="comecar" className="scroll-mt-20 mx-auto w-full max-w-[1120px] px-4 pb-8 pt-4 min-[744px]:px-8 min-[744px]:pb-12">
        <div className="rounded-2xl bg-[#1B2B61] px-6 py-12 min-[744px]:px-12 min-[744px]:py-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#E8ECF6]">Começar</p>
          <h2 className="mt-4 max-w-[18ch] text-balance text-[28px] font-semibold leading-tight tracking-[-0.02em] text-white min-[744px]:text-[36px]">
            Cria a conta e entra no curso.
          </h2>
          <p className="mt-4 max-w-[42ch] text-pretty text-[15px] leading-[1.6] text-[#E8ECF6]">
            Email ou Google. Se for preciso, confirmas o email. Depois o início, e a Aula abre em Hoje. Sem lista de espera.
          </p>
          <div className="mt-8 flex flex-col gap-3 min-[744px]:flex-row">
            <Link
              href="/auth/signup"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-[14px] font-medium text-[#1B2B61] transition-colors hover:bg-[#F3F5FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white min-[744px]:w-auto"
            >
              Criar conta
              <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex h-11 w-full items-center justify-center rounded-full border border-white px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#14214C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white min-[744px]:w-auto"
            >
              Entrar
            </Link>
          </div>
        </div>
      </section>
    </MarketingFrame>
  );
}

function Stat({
  href,
  value,
  label,
  detail,
}: {
  href: string;
  value: string;
  label: string;
  detail: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex min-w-0 items-center gap-4 rounded-xl bg-[#F7F7F6] px-4 py-4 transition-colors hover:bg-[#EFEFED] ${focus}`}
    >
      <span className="w-28 shrink-0 text-[28px] font-semibold tabular-nums tracking-[-0.03em] text-[#1F1F1F] min-[744px]:text-[32px]">
        {value}
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] font-medium text-[#1F1F1F]">{label}</span>
        <span className="mt-1 block text-[12px] leading-relaxed text-[#5A5A57]">{detail}</span>
      </span>
    </Link>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-[#E6E6E4] bg-white p-6">
      <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-[#1F1F1F]">{title}</h3>
      <p className="mt-3 text-pretty text-[14px] leading-[1.6] text-[#5A5A57]">{body}</p>
    </article>
  );
}

function Level({
  level,
  name,
  lessons,
  exam,
  body,
  tone,
}: {
  level: string;
  name: string;
  lessons: string;
  exam?: string;
  body: string;
  tone: "teal" | "navy";
}) {
  const badge = tone === "teal" ? "bg-[#E1F2ED] text-[#1F7A68]" : "bg-[#E8ECF6] text-[#1B2B61]";
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-[#E6E6E4] bg-white p-6">
      <div className="flex items-center gap-3">
        <span className={`inline-flex h-6 items-center rounded-md px-2 text-[12px] font-semibold ${badge}`}>{level}</span>
        <span className="text-[13px] text-[#5A5A57]">{lessons}</span>
      </div>
      <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[#1F1F1F]">{name}</h3>
      <p className="text-pretty text-[14px] leading-[1.6] text-[#5A5A57]">{body}</p>
      {exam && <p className="text-[13px] font-medium text-[#1B2B61]">{exam}</p>}
    </article>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="rounded-2xl border border-[#E6E6E4] bg-white p-6">
      <span className="text-[12px] font-semibold tabular-nums tracking-[0.06em] text-[#1B2B61]">{n}</span>
      <h3 className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-[#1F1F1F]">{title}</h3>
      <p className="mt-3 text-pretty text-[14px] leading-[1.6] text-[#5A5A57]">{body}</p>
    </li>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl border border-[#E6E6E4] bg-white px-5 py-4">
      <summary className={`flex cursor-pointer list-none items-center gap-4 rounded-lg text-[15px] font-medium text-[#1F1F1F] [&::-webkit-details-marker]:hidden ${focus}`}>
        <span className="flex-1">{q}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          aria-hidden
          className="shrink-0 text-[#5A5A57] motion-safe:transition-transform motion-safe:duration-150 group-open:rotate-180"
        />
      </summary>
      <p className="pt-3 text-pretty text-[14px] leading-[1.6] text-[#5A5A57]">{a}</p>
    </details>
  );
}

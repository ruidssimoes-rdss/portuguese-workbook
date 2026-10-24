import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Mark, MarketingFrame } from "@/components/marketing/frame";
import { formatCount, libraryCounts } from "@/lib/library-counts";

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B2B61]";

const counts = libraryCounts;
const words = formatCount(counts.words);
const verbs = formatCount(counts.verbs);
const topics = formatCount(counts.grammarTopics);
const lessons = formatCount(counts.lessons);
const culture = formatCount(counts.culture);

const grammarDetail =
  counts.grammarByLevel.A1 > 0 &&
  counts.grammarByLevel.A1 === counts.grammarByLevel.A2 &&
  counts.grammarByLevel.A2 === counts.grammarByLevel.B1
    ? `${formatCount(counts.grammarByLevel.A1)} em cada nível`
    : "A1, A2 e B1";

const tenseDetail = counts.hasCoreTenses
  ? `${formatCount(counts.tenses)} tempos, do presente ao imperativo`
  : `${formatCount(counts.tenses)} tempos`;

/** Lines that exist in the course. */
const LINES = [
  { href: "/vocabulary/greetings-expressions", pt: "olá", gl: "Cumprimento" },
  { href: "/vocabulary/travel-directions", pt: "autocarro", gl: "Não «ônibus»" },
  { href: "/conjugations/ser", pt: "tu és", gl: "Presente de ser" },
  { href: "/vocabulary/work-education", pt: "estou a trabalhar", gl: "Contínuo de Portugal" },
] as const;

/** Present of ser, as stored in the course. */
const SER = [
  ["eu", "sou"],
  ["tu", "és"],
  ["ele", "é"],
  ["nós", "somos"],
  ["eles", "são"],
] as const;

const LEVELS = [
  {
    level: "A1",
    tone: "text-[#1F7A68]",
    name: "Iniciação",
    lessons: `${formatCount(counts.lessonsA1)} lições`,
    body: "Apresentas-te, pedes um café, dizes as horas e os números.",
    exam: null,
  },
  {
    level: "A2",
    tone: "text-[#1B2B61]",
    name: "Sobreviver no dia a dia",
    lessons: `${formatCount(counts.lessonsA2)} lições`,
    body: "Contas o que fizeste ontem. Tratas de compras, médico e farmácia.",
    exam: "CIPLE, o exame oficial de A2",
  },
  {
    level: "B1",
    tone: "text-[#1B2B61]",
    name: "Conversar à vontade",
    lessons: `${formatCount(counts.lessonsB1)} lições`,
    body: "Dás a tua opinião e justificas. Contas uma história inteira.",
    exam: "DEPLE, o exame oficial de B1",
  },
] as const;

const SIGNS = [
  {
    word: "Autocarro.",
    accent: null,
    gloss: "não «ônibus»",
  },
  {
    word: "Estou ",
    accent: "a fazer.",
    gloss: "não «estou fazendo»",
  },
  {
    word: null,
    accent: "Tu.",
    gloss: "a segunda pessoa, no dia a dia",
  },
] as const;

export function Landing() {
  return (
    <MarketingFrame>
      <section
        id="inicio"
        className="landing-hero mx-auto flex w-full max-w-[1180px] flex-col px-4 pb-10 pt-8 min-[744px]:min-h-[calc(100dvh-4.5rem)] min-[744px]:justify-between min-[744px]:px-8 min-[744px]:pb-12 min-[744px]:pt-12"
      >
        <div className="grid items-start gap-x-16 gap-y-8 min-[744px]:grid-cols-[minmax(0,1fr)_220px] min-[744px]:gap-y-16 min-[1100px]:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 min-[744px]:row-span-2 motion-safe:animate-fade-in-up motion-reduce:animate-none">
            <p className="text-[12px] font-medium tracking-[0.16em] text-[#5A5A57]">PORTUGUÊS EUROPEU</p>
            <h1 className="mt-6 text-[40px] font-medium leading-[0.96] tracking-[-0.045em] text-[#1F1F1F] min-[744px]:text-[52px] min-[1100px]:text-[68px]">
              O português
              <br />
              que se fala
              <br />
              <span className="text-[#1B2B61]">em Portugal.</span>
            </h1>
            <p className="mt-8 max-w-[36rem] text-pretty text-[16px] leading-[1.6] text-[#5A5A57] min-[744px]:text-[18px]">
              A Aula é um curso de A1 a B1. A biblioteca fica ao lado das lições, e a revisão volta quando estás a esquecer. Crias a conta e entras.
            </p>
            <p className="mt-5 text-[15px] font-medium tracking-[-0.01em] text-[#1F1F1F]">
              {words} palavras
              <span className="px-2 text-[#5A5A57]" aria-hidden>
                ·
              </span>
              {verbs} verbos
              <span className="px-2 text-[#5A5A57]" aria-hidden>
                ·
              </span>
              {topics} tópicos
              <span className="px-2 text-[#5A5A57]" aria-hidden>
                ·
              </span>
              {lessons} lições
            </p>
            <div className="mt-8 flex flex-col gap-3 min-[744px]:flex-row">
              <Link
                href="/auth/signup"
                className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1B2B61] px-6 text-[15px] font-medium text-white transition-colors hover:bg-[#14214C] min-[744px]:w-auto ${focus}`}
              >
                Criar conta
                <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
              </Link>
              <Link
                href="/auth/login"
                className={`inline-flex h-12 w-full items-center justify-center rounded-full border border-[#E6E6E4] bg-white px-6 text-[15px] font-medium text-[#1F1F1F] transition-colors hover:bg-[#EFEFED] min-[744px]:w-auto ${focus}`}
              >
                Entrar
              </Link>
            </div>
          </div>

          <div className="hidden min-[744px]:mt-10 min-[744px]:block">
            <Mark className="h-[148px] w-[148px] min-[1100px]:h-[168px] min-[1100px]:w-[168px]" />
          </div>

          <Link href="/conjugations/ser" className={`group block rounded-2xl ${focus}`}>
            <p className="text-[12px] font-medium tracking-[0.16em] text-[#5A5A57]">PRESENTE DE SER</p>
            <p className="mt-4 text-[32px] font-medium tracking-[-0.04em] text-[#1F1F1F] transition-colors group-hover:text-[#1B2B61] min-[1100px]:text-[40px]">
              ser
            </p>
            <dl className="mt-4 grid max-w-[16rem] grid-cols-[4.25rem_minmax(0,1fr)] gap-y-1 text-[18px] leading-8 min-[1100px]:text-[20px]">
              {SER.map(([person, form]) => (
                <Fragment key={person}>
                  <dt className="text-[#5A5A57]">{person}</dt>
                  <dd className="font-medium text-[#1F1F1F]">{form}</dd>
                </Fragment>
              ))}
            </dl>
          </Link>
        </div>

        <div className="mt-16 min-[744px]:mt-0">
          <p className="text-[12px] font-medium tracking-[0.16em] text-[#5A5A57]">DO CURSO</p>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-6 min-[744px]:grid-cols-4">
            {LINES.map((line) => (
              <Link key={line.pt} href={line.href} className={`block rounded-xl py-1 ${focus}`}>
                <span className="block text-[12px] tracking-[0.04em] text-[#5A5A57]">{line.gl}</span>
                <span className="mt-2 block text-[20px] font-medium tracking-[-0.03em] text-[#1F1F1F] transition-colors hover:text-[#1B2B61] min-[1100px]:text-[26px]">
                  {line.pt}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="sinais" className="scroll-mt-24 mx-auto w-full max-w-[1180px] px-4 py-20 min-[744px]:px-8 min-[744px]:py-28 min-[1100px]:py-32">
        <p className="text-[12px] font-medium tracking-[0.16em] text-[#5A5A57]">O PORTUGUÊS DE PORTUGAL</p>
        <h2 className="mt-8 flex flex-col gap-6 min-[1100px]:gap-3">
          {SIGNS.map((sign) => (
            <span
              key={sign.gloss}
              className="flex flex-col gap-2 min-[1100px]:flex-row min-[1100px]:items-baseline min-[1100px]:justify-between min-[1100px]:gap-10"
            >
              <span className="text-[40px] font-medium leading-[0.98] tracking-[-0.045em] text-[#1F1F1F] min-[744px]:text-[56px] min-[1100px]:text-[72px]">
                {sign.word}
                {sign.accent ? <span className="text-[#1B2B61]">{sign.accent}</span> : null}
              </span>
              <span className="text-[16px] font-medium text-[#1B2B61] min-[1100px]:text-[18px]">{sign.gloss}</span>
            </span>
          ))}
        </h2>
        <p className="mt-10 max-w-[36rem] text-pretty text-[17px] leading-[1.6] text-[#5A5A57] min-[744px]:mt-12 min-[744px]:text-[18px]">
          O vocabulário, a gramática, o uso e o áudio são de Portugal, do princípio ao fim. Não há uma versão do Brasil ao lado.
        </p>
      </section>

      <section id="biblioteca" className="scroll-mt-24 mx-auto w-full max-w-[1180px] px-4 py-8 min-[744px]:px-8 min-[744px]:py-16 min-[1100px]:py-24">
        <div className="grid items-start gap-10 min-[1100px]:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] min-[1100px]:gap-16">
          <div>
            <p className="text-[12px] font-medium tracking-[0.16em] text-[#5A5A57]">A BIBLIOTECA</p>
            <h2 className="mt-4 text-balance text-[36px] font-medium leading-[1.02] tracking-[-0.04em] min-[744px]:text-[48px]">
              Contada a partir do curso.
            </h2>
            <p className="mt-5 max-w-[32ch] text-pretty text-[16px] leading-[1.6] text-[#5A5A57]">
              Cada número sai dos ficheiros desta versão. A biblioteca abre sem conta.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <IndexRow href="/vocabulary" label="Vocabulário" value={words} detail={`${formatCount(counts.themes)} temas`} />
            <IndexRow href="/grammar" label="Gramática" value={topics} detail={grammarDetail} />
            <IndexRow href="/conjugations" label="Verbos" value={verbs} detail={tenseDetail} />
            <IndexRow
              href="/culture"
              label="Cultura"
              value={culture}
              detail={
                <>
                  {formatCount(counts.sayings)} ditados · {formatCount(counts.falseFriends)} falsos amigos
                  <br />
                  {formatCount(counts.etiquette)} de etiqueta · {formatCount(counts.regional)} regionais
                </>
              }
            />
            <IndexRow
              href="/lessons"
              label="Lições"
              value={lessons}
              detail={`${formatCount(counts.lessonsA1)} de A1, ${formatCount(counts.lessonsA2)} de A2, ${formatCount(counts.lessonsB1)} de B1`}
            />
          </div>
        </div>
      </section>

      <section id="percurso" className="scroll-mt-24 mx-auto w-full max-w-[1180px] px-4 py-20 min-[744px]:px-8 min-[744px]:py-28 min-[1100px]:py-32">
        <p className="text-[12px] font-medium tracking-[0.16em] text-[#5A5A57]">O PERCURSO</p>
        <h2 className="mt-4 max-w-[16ch] text-[36px] font-medium leading-[1.02] tracking-[-0.04em] min-[744px]:text-[52px]">
          Do primeiro olá a uma história inteira.
        </h2>
        <p className="mt-5 max-w-[40rem] text-pretty text-[16px] leading-[1.6] text-[#5A5A57] min-[744px]:text-[17px]">
          A1, A2 e B1, no Quadro Europeu. O nível seguinte abre quando estás 75% pronto no atual.
        </p>
        <div className="mt-12 grid gap-y-12 min-[744px]:mt-16 min-[744px]:grid-cols-3 min-[744px]:gap-x-8 min-[1100px]:gap-x-12">
          {LEVELS.map((level) => (
            <article key={level.level}>
              <p className={`text-[72px] font-medium leading-none tracking-[-0.05em] min-[1100px]:text-[96px] ${level.tone}`}>
                {level.level}
              </p>
              <h3 className="mt-4 text-[20px] font-semibold tracking-[-0.02em] text-[#1F1F1F]">{level.name}</h3>
              <p className="mt-3 text-[15px] leading-[1.6] text-[#5A5A57]">
                <span className="text-[#1F1F1F]">{level.lessons}.</span> {level.body}
              </p>
              {level.exam ? <p className="mt-4 text-[14px] font-medium leading-snug text-[#1B2B61]">{level.exam}</p> : null}
            </article>
          ))}
        </div>
        <p className="mt-12 max-w-[46rem] text-[14px] leading-relaxed text-[#5A5A57]">
          Há um simulado no formato do CIPLE. Os outros exames da lista ainda estão por abrir. O percurso de B1 aponta para o DEPLE.
        </p>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 py-8 min-[744px]:px-8 min-[744px]:py-16 min-[1100px]:py-24">
        <p className="text-[12px] font-medium tracking-[0.16em] text-[#5A5A57]">COMO SE ESTUDA</p>
        <h2 className="mt-4 max-w-[14ch] text-[36px] font-medium leading-[1.02] tracking-[-0.04em] min-[744px]:text-[48px]">
          Três passos, e o que fica.
        </h2>
        <ol className="mt-12 grid list-none gap-10 p-0 min-[744px]:grid-cols-3 min-[744px]:gap-8">
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
            body="Acertas e o intervalo cresce. Erras e a revisão volta no dia seguinte. As palavras e os verbos mais comuns voltam mais cedo."
          />
        </ol>

        <div className="mt-12 grid gap-8 rounded-3xl border border-[#E6E6E4] bg-white px-6 py-8 min-[744px]:mt-16 min-[744px]:grid-cols-2 min-[744px]:gap-12 min-[744px]:px-10 min-[744px]:py-10">
          <div>
            <h3 className="text-[20px] font-semibold tracking-[-0.02em]">A revisão</h3>
            <p className="mt-3 text-[15px] leading-[1.65] text-[#5A5A57]">
              Cada palavra, verbo e regra fica com uma data. Não é uma lista para decorar de uma vez. O que está na hora volta sozinho.
            </p>
          </div>
          <div>
            <h3 className="text-[20px] font-semibold tracking-[-0.02em]">O Professor Elísio</h3>
            <p className="mt-3 text-[15px] leading-[1.65] text-[#5A5A57]">
              Prepara uma sessão com o que já estudaste e responde com o texto do curso. Não é um chat pago, nem um modelo de fora, nem um parceiro de conversa.
            </p>
          </div>
        </div>
      </section>

      <section id="perguntas" className="scroll-mt-24 mx-auto w-full max-w-[1180px] px-4 py-20 min-[744px]:px-8 min-[744px]:py-28">
        <div className="grid gap-10 min-[1100px]:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] min-[1100px]:gap-20">
          <h2 className="text-[36px] font-medium leading-[1.02] tracking-[-0.04em] min-[744px]:text-[48px]">
            Antes de criares a conta.
          </h2>
          <div className="rounded-3xl border border-[#E6E6E4] bg-white px-4 min-[744px]:px-6">
            <Faq q="Isto é português do Brasil?" a="Não. O vocabulário, a gramática, o uso e o áudio são de Portugal." />
            <Faq
              q="O Professor Elísio é um chat de inteligência artificial?"
              a="Não. Prepara uma sessão com o que já estudaste e responde com o texto do curso. Não há modelo pago, nem um parceiro de conversa."
            />
            <Faq q="Há uma aplicação para o telemóvel?" a="Não. A Aula abre no browser. Não há aplicação para instalar." />
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
        </div>
      </section>

      <section id="comecar" className="scroll-mt-24 flex min-h-[calc(100dvh-4.5rem)] items-center bg-[#1B2B61]">
        <div className="mx-auto grid w-full max-w-[1180px] items-center gap-10 px-4 py-20 min-[744px]:grid-cols-[160px_minmax(0,1fr)] min-[744px]:gap-x-16 min-[744px]:px-8 min-[744px]:py-24">
          <Mark tone="white" className="h-[88px] w-[88px] min-[744px]:h-[160px] min-[744px]:w-[160px]" />
          <div>
            <h2 className="max-w-[12ch] text-[44px] font-medium leading-[0.96] tracking-[-0.045em] text-white min-[744px]:text-[60px] min-[1100px]:text-[72px]">
              Cria a conta.
              <br />
              O curso abre.
            </h2>
            <p className="mt-6 max-w-[36rem] text-pretty text-[16px] leading-[1.6] text-[#E8ECF6] min-[744px]:text-[18px]">
              Email ou Google. Se for preciso, confirmas o email. Depois o início, e a Aula abre em Hoje. Sem lista de espera.
            </p>
            <div className="mt-8 flex flex-col gap-3 min-[744px]:flex-row">
              <Link
                href="/auth/signup"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-[15px] font-medium text-[#1B2B61] transition-colors hover:bg-[#F3F5FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white min-[744px]:w-auto"
              >
                Criar conta
                <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white px-6 text-[15px] font-medium text-white transition-colors hover:bg-[#14214C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white min-[744px]:w-auto"
              >
                Entrar
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingFrame>
  );
}

function IndexRow({
  href,
  label,
  value,
  detail,
}: {
  href: string;
  label: string;
  value: string;
  detail: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 rounded-2xl px-4 py-4 transition-colors hover:bg-white min-[744px]:grid-cols-[10rem_7.5rem_minmax(0,1fr)] min-[744px]:items-center min-[744px]:px-5 min-[744px]:py-5 ${focus}`}
    >
      <span className="text-[16px] font-medium text-[#1F1F1F]">{label}</span>
      <span className="text-right text-[32px] font-medium tabular-nums tracking-[-0.04em] text-[#1F1F1F] min-[744px]:text-left min-[1100px]:text-[40px]">
        {value}
      </span>
      <span className="col-span-2 text-[13px] leading-relaxed text-[#5A5A57] min-[744px]:col-span-1">{detail}</span>
    </Link>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li>
      <span className="text-[40px] font-medium tabular-nums tracking-[-0.04em] text-[#1B2B61] min-[1100px]:text-[48px]">{n}</span>
      <h3 className="mt-4 text-[18px] font-semibold tracking-[-0.02em]">{title}</h3>
      <p className="mt-2 text-[15px] leading-[1.65] text-[#5A5A57]">{body}</p>
    </li>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-0 py-1">
      <summary
        className={`flex cursor-pointer list-none items-center gap-4 rounded-xl px-2 py-4 text-[16px] font-medium text-[#1F1F1F] [&::-webkit-details-marker]:hidden ${focus}`}
      >
        <span className="flex-1">{q}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          aria-hidden
          className="shrink-0 text-[#5A5A57] motion-safe:transition-transform motion-safe:duration-150 group-open:rotate-180"
        />
      </summary>
      <p className="px-2 pb-4 text-pretty text-[15px] leading-[1.65] text-[#5A5A57]">{a}</p>
    </details>
  );
}

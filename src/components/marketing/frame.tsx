import Link from "next/link";

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B2B61]";

/** Official guitarra portuguesa. Uniform scale only; never redrawn. */
export function Mark({
  tone = "navy",
  className = "h-6 w-6",
}: {
  tone?: "navy" | "white";
  className?: string;
}) {
  const src = tone === "white" ? "/brand/aula-mark-white.svg" : "/brand/aula-mark-master.svg";
  return (
    // eslint-disable-next-line @next/next/no-img-element -- official mark SVG, not redrawn
    <img
      src={src}
      alt=""
      width={24}
      height={24}
      draggable={false}
      aria-hidden
      className={`block shrink-0 ${className}`}
    />
  );
}

function Lockup() {
  return (
    <Link href="/" className={`inline-flex shrink-0 rounded-lg ${focus}`} aria-label="Aula, início">
      {/* eslint-disable-next-line @next/next/no-img-element -- official lockup SVG, not redrawn */}
      <img
        src="/brand/aula-lockup-transparent-navy.svg"
        alt=""
        width={83}
        height={40}
        draggable={false}
        className="block h-10 w-auto"
      />
    </Link>
  );
}

const MAP = [
  ["/vocabulary", "Vocabulário"],
  ["/grammar", "Gramática"],
  ["/conjugations", "Conjugações"],
  ["/culture", "Cultura"],
  ["/lessons", "Lições"],
  ["/exams", "Exames"],
  ["/guide", "Como funciona"],
  ["/privacy", "Privacidade"],
] as const;

export function MarketingFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#F7F7F6] text-[#1F1F1F]">
      <a
        href="#conteudo"
        className={`sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-30 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-[14px] focus:font-medium ${focus}`}
      >
        Saltar para o conteúdo
      </a>
      <header className="sticky top-0 z-20 bg-[#F7F7F6]">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-[1180px] items-center gap-6 px-4 min-[744px]:px-8">
          <Lockup />
          <nav aria-label="Nesta página" className="hidden items-center gap-6 min-[744px]:flex">
            <Link href="/#biblioteca" className={`text-[14px] text-[#1F1F1F] transition-colors hover:text-[#1B2B61] ${focus} rounded-md`}>
              Biblioteca
            </Link>
            <Link href="/#percurso" className={`text-[14px] text-[#1F1F1F] transition-colors hover:text-[#1B2B61] ${focus} rounded-md`}>
              Percurso
            </Link>
          </nav>
          <div className="flex-1" />
          <nav aria-label="Conta" className="flex items-center gap-2 min-[744px]:gap-3">
            <Link
              href="/auth/login"
              className={`inline-flex h-10 items-center rounded-full px-3 text-[14px] font-medium text-[#1F1F1F] transition-colors hover:bg-[#EFEFED] ${focus}`}
            >
              Entrar
            </Link>
            <Link
              href="/auth/signup"
              className={`inline-flex h-10 items-center rounded-full bg-[#1B2B61] px-4 text-[14px] font-medium text-white transition-colors hover:bg-[#14214C] ${focus}`}
            >
              Criar conta
            </Link>
          </nav>
        </div>
      </header>
      <main id="conteudo">{children}</main>
      <footer className="mx-auto w-full max-w-[1180px] px-4 pb-12 pt-16 min-[744px]:px-8 min-[744px]:pb-16 min-[744px]:pt-20">
        <div className="flex flex-col gap-8 min-[744px]:flex-row min-[744px]:items-end min-[744px]:justify-between">
          <Lockup />
          <p className="max-w-[32ch] text-[15px] leading-relaxed text-[#5A5A57]">
            Português europeu, do A1 ao B1. O vocabulário, a gramática e o uso são de Portugal.
          </p>
        </div>
        <nav aria-label="Mapa" className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
          {MAP.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`rounded-md text-[14px] text-[#1F1F1F] transition-colors hover:text-[#1B2B61] ${focus}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  );
}

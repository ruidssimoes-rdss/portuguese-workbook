import Link from "next/link";

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B2B61]";

function Lockup({ href }: { href: string }) {
  return (
    <Link href={href} className={`inline-flex shrink-0 rounded-lg ${focus}`} aria-label="Aula, início">
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

export function MarketingFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#F7F7F6] text-[#1F1F1F]">
      <a
        href="#conteudo"
        className={`sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-[14px] focus:font-medium ${focus}`}
      >
        Saltar para o conteúdo
      </a>
      <header className="sticky top-0 z-10 bg-[#F7F7F6]">
        <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between gap-4 px-4 py-4 min-[744px]:px-8 min-[744px]:py-5">
          <Lockup href="/" />
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
      <footer className="mx-auto w-full max-w-[1120px] px-4 pb-12 pt-4 min-[744px]:px-8 min-[744px]:pb-16">
        <div className="flex flex-col gap-8 rounded-2xl border border-[#E6E6E4] bg-white px-6 py-8 min-[744px]:px-8">
          <div className="flex flex-col gap-4 min-[744px]:flex-row min-[744px]:items-center min-[744px]:justify-between">
            <Lockup href="/" />
            <p className="max-w-[36ch] text-[13px] leading-relaxed text-[#5A5A57]">
              Português europeu, do A1 ao B1. Vocabulário, gramática e uso de Portugal.
            </p>
          </div>
          <nav aria-label="Mapa" className="flex flex-wrap gap-x-6 gap-y-3">
            {[
              ["/vocabulary", "Vocabulário"],
              ["/grammar", "Gramática"],
              ["/conjugations", "Conjugações"],
              ["/culture", "Cultura"],
              ["/lessons", "Lições"],
              ["/exams", "Exames"],
              ["/guide", "Como funciona"],
              ["/privacy", "Privacidade"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={`text-[13px] font-medium text-[#1F1F1F] transition-colors hover:text-[#1B2B61] ${focus} rounded-md`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}

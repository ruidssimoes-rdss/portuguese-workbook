import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[800px] px-6 py-24 text-center">
      <p className="text-[48px] font-semibold text-text-primary tabular-nums">404</p>
      <p className="mt-2 text-headline font-semibold text-text-primary">Página não encontrada</p>
      <p className="mt-1 text-ui text-text-secondary">A página que procuras não existe.</p>
      <Link
        href="/"
        className="mt-6 inline-flex h-9 items-center rounded-card bg-accent px-5 text-ui font-medium text-text-on-accent transition-colors hover:bg-accent-hover"
      >
        Voltar a Hoje
      </Link>
    </div>
  );
}

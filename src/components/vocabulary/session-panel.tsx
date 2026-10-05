import Link from "next/link";
import { Panel } from "@/components/shell/panel";
import { formatCount } from "@/lib/format";
import type { SessionPreview } from "@/lib/shell/session-preview";

/** The review session this folder would start. */
export function SessionPanel({ title, session }: { title: string; session: SessionPreview }) {
  return (
    <Panel label="Sessão de revisão">
      <section aria-labelledby="sessao" className="rounded-card border border-border-default bg-surface-raised p-4">
        <h2 id="sessao" className="text-[13px] font-medium text-text-primary">Sessão de revisão</h2>
        <p className="mt-0.5 text-caption text-text-quaternary">{title}</p>

        {session.total === 0 ? (
          <p className="mt-4 text-small text-text-secondary">Nada para rever agora. Volta quando houver palavras devidas.</p>
        ) : (
          <>
            <dl className="mt-4 flex flex-col gap-2 text-small">
              <div className="flex items-center justify-between">
                <dt className="text-text-secondary">Palavras</dt>
                <dd className="tabular-nums text-text-primary">{formatCount(session.total)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-text-secondary">Em atraso</dt>
                <dd className={`tabular-nums ${session.overdue > 0 ? "text-state-overdue" : "text-text-primary"}`}>
                  {formatCount(session.overdue)}
                </dd>
              </div>
            </dl>
            <Link
              href={session.startHref}
              className="mt-4 flex h-8 items-center justify-center rounded-control bg-accent text-ui font-medium text-text-on-accent transition-colors hover:bg-accent-hover"
            >
              Começar {session.total === 1 ? "a 1" : `as ${formatCount(session.total)}`}
            </Link>
            {session.overdue > 0 && session.overdue < session.total && (
              <Link
                href={session.overdueHref}
                className="mt-2 flex h-8 items-center justify-center rounded-control border border-border-default bg-surface-raised text-ui text-text-primary transition-colors hover:border-border-strong hover:bg-surface-sunken"
              >
                Só {session.overdue === 1 ? "a 1" : `as ${formatCount(session.overdue)}`} em atraso
              </Link>
            )}
          </>
        )}
      </section>
    </Panel>
  );
}

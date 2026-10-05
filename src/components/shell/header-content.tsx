import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

/** Breadcrumb and page actions, rendered into the header by each route's @header slot. */
export function HeaderContent({ crumbs, actions }: { crumbs: Crumb[]; actions?: React.ReactNode }) {
  return (
    <>
      <nav aria-label="Caminho" className="min-w-0">
        <ol className="flex items-center gap-2 text-ui">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <li key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-2">
                {i > 0 && (
                  <span aria-hidden className="text-text-quaternary">
                    /
                  </span>
                )}
                {last || !c.href ? (
                  <span aria-current={last ? "page" : undefined} className={`truncate ${last ? "text-text-primary" : "text-text-quaternary"}`}>
                    {c.label}
                  </span>
                ) : (
                  <Link
                    href={c.href}
                    className="truncate rounded-xs text-text-quaternary transition-colors hover:text-text-primary"
                  >
                    {c.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </>
  );
}

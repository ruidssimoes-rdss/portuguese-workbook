import Link from "next/link";
import { ArrowRight, ChevronLeft, CircleAlert, Eye, EyeOff, Mail } from "lucide-react";
import { AuthLogo } from "@/components/auth-ui";
import { HowItWorks } from "@/components/auth/how-it-works";

/**
 * Auth pages share one card.
 * Below 744px the card is the existing narrow column (logo inside).
 * From 744px up it is the split frame: Como funciona on the left, the form on the right.
 */
export function AuthScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-aula-canvas px-4 py-12 min-[744px]:justify-start min-[744px]:px-8 min-[744px]:py-8">
      <header className="mb-6 hidden w-full max-w-[960px] items-center gap-3 min-[744px]:flex">
        <Link href="/welcome" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- official lockup SVG */}
          <img
            src="/brand/aula-lockup-transparent-navy.svg"
            alt="Aula"
            width={117}
            height={56}
            draggable={false}
            className="block h-8 w-auto"
          />
          <span className="text-[13px] text-[#5A5A57]">Português europeu</span>
        </Link>
      </header>
      <div className="flex w-full flex-1 items-center justify-center min-[744px]:flex-none">
        <div className="w-full max-w-[380px] min-[744px]:max-w-[960px]">
          <div className="rounded-2xl border border-aula-line bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] min-[744px]:grid min-[744px]:min-h-[560px] min-[744px]:grid-cols-2 min-[744px]:overflow-hidden min-[744px]:p-0 min-[744px]:shadow-[0_8px_28px_rgba(27,43,97,0.06)]">
            <HowItWorks />
            <div className="min-[744px]:flex min-[744px]:flex-col min-[744px]:justify-center min-[744px]:px-8 min-[744px]:py-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthMobileLogo() {
  return (
    <div className="min-[744px]:hidden">
      <Link href="/welcome" className="block">
        <AuthLogo />
      </Link>
    </div>
  );
}

export function AuthTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mb-6 text-center text-[18px] font-semibold tracking-[-0.01em] text-aula-text min-[744px]:mb-6 min-[744px]:text-left min-[744px]:text-[22px] min-[744px]:tracking-[-0.02em]">
      {children}
    </h1>
  );
}

export function AuthError({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-4 flex items-start gap-2 rounded-[10px] border border-[#F0C9BE] bg-[#FBE9E4] px-3.5 py-2.5 text-[12.5px] text-[#8C3220] min-[744px]:text-[13px]"
      role="alert"
    >
      <CircleAlert size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-[#B94A32]" aria-hidden />
      <span>{children}</span>
    </div>
  );
}

export const authLabelClass = "text-[12px] font-medium text-aula-text-2 min-[744px]:text-[12px] min-[744px]:text-[#5A5A57]";

export function authInputClass(invalid = false) {
  return [
    "h-10 w-full rounded-lg border bg-white px-3 text-[13.5px] text-aula-text outline-none transition-colors placeholder:text-aula-text-4",
    "min-[744px]:h-11 min-[744px]:rounded-xl min-[744px]:px-3 min-[744px]:text-[14px] min-[744px]:placeholder:text-[#6B6B69]",
    invalid
      ? "border-[#B94A32] focus:border-[#B94A32]"
      : "border-aula-border focus:border-aula-accent",
  ].join(" ");
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoFocus,
  autoComplete,
  invalid,
  hint,
  revealed,
  onToggleReveal,
  labelExtra,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  autoComplete: string;
  invalid?: boolean;
  hint?: string;
  revealed: boolean;
  onToggleReveal: () => void;
  labelExtra?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={authLabelClass}>
          {label}
        </label>
        {labelExtra}
      </div>
      <div className="relative">
        <input
          id={id}
          type={revealed ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${authInputClass(invalid)} min-[744px]:pr-11`}
          required
          minLength={autoComplete === "new-password" ? 6 : undefined}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          aria-invalid={invalid || undefined}
        />
        <button
          type="button"
          onClick={onToggleReveal}
          className="absolute right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center text-[#5A5A57] min-[744px]:flex"
          aria-label={revealed ? "Esconder palavra-passe" : "Mostrar palavra-passe"}
        >
          {revealed ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
        </button>
      </div>
      {hint && <p className="mt-1 text-[11px] text-aula-text-3 min-[744px]:mt-2 min-[744px]:text-[12px] min-[744px]:text-[#5A5A57]">{hint}</p>}
    </div>
  );
}

export function AuthSubmit({
  loading,
  idle,
  busy,
}: {
  loading: boolean;
  idle: string;
  busy: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-aula-accent text-[13.5px] font-medium text-white transition-colors hover:bg-aula-accent-hover disabled:cursor-not-allowed disabled:opacity-60 min-[744px]:h-11 min-[744px]:rounded-full min-[744px]:text-[14px]"
    >
      {loading ? (
        <>
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          {busy}
        </>
      ) : (
        <>
          {idle}
          <ArrowRight size={16} strokeWidth={1.75} className="hidden min-[744px]:block" aria-hidden />
        </>
      )}
    </button>
  );
}

export function SentMail({
  title,
  body,
}: {
  title: string;
  body: React.ReactNode;
}) {
  return (
    <>
      <AuthMobileLogo />
      <div className="mb-4 hidden h-10 w-10 items-center justify-center rounded-xl bg-[#F3F5FA] text-[#1B2B61] min-[744px]:flex">
        <Mail size={18} strokeWidth={1.75} aria-hidden />
      </div>
      <h1 className="mb-2 text-center text-[18px] font-semibold tracking-[-0.01em] text-aula-text min-[744px]:text-left min-[744px]:text-[22px]">
        {title}
      </h1>
      <p className="text-center text-[13px] leading-relaxed text-aula-text-2 min-[744px]:text-left min-[744px]:text-[14px] min-[744px]:text-[#5A5A57]">
        {body}
      </p>
      <Link
        href="/auth/login"
        className="mt-6 block text-center text-[13px] font-medium text-aula-accent min-[744px]:hidden"
      >
        Voltar ao login
      </Link>
      <Link
        href="/auth/login"
        className="mt-6 hidden h-11 w-full items-center justify-center gap-2 rounded-full border border-[#E6E6E4] text-[14px] font-medium text-[#1F1F1F] transition-colors hover:bg-[#F7F7F6] min-[744px]:flex"
      >
        <ChevronLeft size={16} strokeWidth={1.75} aria-hidden />
        Voltar ao login
      </Link>
    </>
  );
}

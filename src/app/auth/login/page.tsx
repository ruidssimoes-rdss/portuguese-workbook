"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { AuthLogo } from "@/components/auth-ui";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

const inputClass =
  "h-10 w-full rounded-lg border border-aula-border bg-white px-3 text-[13.5px] text-aula-text outline-none transition-colors placeholder:text-aula-text-4 focus:border-aula-accent";
const labelClass = "mb-1.5 block text-[12px] font-medium text-aula-text-2";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "auth_callback_error") {
      setError("Ocorreu um erro ao iniciar sessão. Tenta novamente.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        if (signInError.message.includes("Invalid login")) {
          setError("Email ou palavra-passe incorretos.");
        } else if (signInError.message.toLowerCase().includes("confirm")) {
          setError("Confirma o teu email antes de entrar. Verifica a tua caixa de entrada.");
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Ocorreu um erro. Tenta novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-aula-canvas px-4 py-12">
      <div className="w-full max-w-[380px] mx-auto">
        <div className="rounded-2xl border border-aula-line bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <AuthLogo />
          <h1 className="mb-6 text-center text-[18px] font-semibold tracking-[-0.01em] text-aula-text">Olá outra vez</h1>

          {error && (
            <div
              className="mb-4 rounded-[10px] border border-[#F0C9BE] bg-[#FBE9E4] px-3.5 py-2.5 text-[12.5px] text-aula-overdue"
              role="alert"
            >
              {error}
            </div>
          )}

          <GoogleSignInButton />

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-aula-line" />
            <span className="text-[11.5px] text-aula-text-3">ou</span>
            <div className="h-px flex-1 bg-aula-line" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className={labelClass}>
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className={inputClass}
                required
                autoFocus
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="login-password" className={labelClass}>
                Palavra-passe
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className={inputClass}
                required
                autoComplete="current-password"
              />
              <p className="mt-1.5 text-[13px]">
                <Link
                  href="/auth/reset-password"
                  className="text-aula-text-3 hover:text-aula-accent"
                >
                  Esqueceste a palavra-passe?
                </Link>
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-10 w-full rounded-lg bg-aula-accent text-[13.5px] font-medium text-white hover:bg-aula-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  A carregar…
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-aula-text-3">
            Ainda não tens conta?{" "}
            <Link href="/auth/signup" className="font-medium text-aula-accent">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-dvh items-center justify-center bg-aula-canvas">
        <div className="text-aula-text-3">A carregar…</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

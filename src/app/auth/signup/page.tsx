"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLogo } from "@/components/auth-ui";
import { createClient } from "@/lib/supabase/client";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

const inputClass =
  "h-10 w-full rounded-lg border border-aula-border bg-white px-3 text-[13.5px] text-aula-text outline-none transition-colors placeholder:text-aula-text-4 focus:border-aula-accent";
const labelClass = "mb-1.5 block text-[12px] font-medium text-aula-text-2";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      setRegisteredEmail(email);
      setSuccess(true);
    } catch {
      setError("Ocorreu um erro. Tenta novamente.");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-aula-canvas px-4 py-12">
        <div className="w-full max-w-[380px] mx-auto">
          <div className="rounded-2xl border border-aula-line bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <AuthLogo />
            <h1 className="mb-2 text-center text-[18px] font-semibold tracking-[-0.01em] text-aula-text">
              Verifica o teu email
            </h1>
            <p className="text-center text-[13px] text-aula-text-2">
              Enviámos um link de confirmação para <strong>{registeredEmail}</strong>. Clica no link para ativar a tua conta.
            </p>
            <Link
              href="/auth/login"
              className="mt-6 block text-center text-[13px] font-medium text-aula-accent"
            >
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-aula-canvas px-4 py-12">
      <div className="w-full max-w-[380px] mx-auto">
        <div className="rounded-2xl border border-aula-line bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <AuthLogo />
          <h1 className="mb-6 text-center text-[18px] font-semibold tracking-[-0.01em] text-aula-text">Criar conta</h1>

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
              <label htmlFor="signup-name" className={labelClass}>
                Nome
              </label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                className={inputClass}
                required
                autoFocus
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="signup-email" className={labelClass}>
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className={inputClass}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="signup-password" className={labelClass}>
                Palavra-passe
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className={inputClass}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <p className="mt-1 text-[11px] text-aula-text-3">Mínimo 6 caracteres</p>
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
                "Criar conta"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-aula-text-3">
            Já tens conta?{" "}
            <Link href="/auth/login" className="font-medium text-aula-accent">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { BrandLogo } from "@/components/brand-logo";

const inputClass =
  "w-full rounded-lg border border-gray-200 px-4 py-3 text-base focus:ring-2 focus:ring-[#3C5E95] focus:border-[#3C5E95] outline-none transition-colors";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

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
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-bg">
        <div className="w-full max-w-md mx-auto">
          <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
            <Link href="/" className="mb-1 flex justify-center">
              <BrandLogo size="auth" priority />
            </Link>
            <h1 className="text-center text-lg font-semibold text-text mt-4 mb-2">
              Verifica o teu email
            </h1>
            <p className="text-center text-gray-600 text-[14px]">
              Enviámos um link de confirmação para <strong>{registeredEmail}</strong>. Clica no link para ativar a tua conta.
            </p>
            <Link
              href="/auth/login"
              className="mt-6 block text-center text-[14px] font-medium text-[#3C5E95] hover:underline"
            >
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-bg">
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <Link href="/" className="mb-1 flex justify-center">
            <BrandLogo size="auth" priority />
          </Link>
          <p className="text-center text-gray-500 text-[15px] mb-6">
            Criar conta
          </p>

          {error && (
            <div
              className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          <GoogleSignInButton />

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-sm text-gray-400">ou</span>
            <div className="flex-1 border-t border-gray-200" />
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
              <p className="mt-1 text-xs text-gray-400">Mínimo 6 caracteres</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#3C5E95] py-3 text-white font-medium text-[15px] hover:bg-[#2E4A75] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  A carregar...
                </>
              ) : (
                "Criar conta"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[14px] text-gray-600">
            Já tens conta?{" "}
            <Link href="/auth/login" className="font-medium text-[#3C5E95] hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

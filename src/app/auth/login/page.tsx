"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { BrandLogo } from "@/components/brand-logo";

const inputClass =
  "w-full rounded-lg border border-gray-200 px-4 py-3 text-base focus:ring-2 focus:ring-[#111827] focus:border-[#111827] outline-none transition-colors";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-bg">
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <Link href="/" className="mb-1 flex justify-center">
            <BrandLogo size="auth" priority />
          </Link>
          <p className="text-center text-gray-500 text-[15px] mb-6">
            Bem-vindo de volta
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
              <p className="mt-1.5 text-sm">
                <Link
                  href="/auth/reset-password"
                  className="text-[#3C5E95] hover:underline"
                >
                  Esqueceste a palavra-passe?
                </Link>
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#111827] py-3 text-white font-medium text-[15px] hover:bg-[#1F2937] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  A carregar...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[14px] text-gray-600">
            Ainda não tens conta?{" "}
            <Link href="/auth/signup" className="font-medium text-[#3C5E95] hover:underline">
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
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-gray-400">A carregar...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

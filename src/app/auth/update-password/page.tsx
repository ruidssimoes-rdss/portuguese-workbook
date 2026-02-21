"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/brand-logo";

const inputClass =
  "w-full rounded-lg border border-gray-200 px-4 py-3 text-base focus:ring-2 focus:ring-[#3C5E95] focus:border-[#3C5E95] outline-none transition-colors";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("As palavras-passe não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("Mínimo 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
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
            Nova palavra-passe
          </p>

          {error && (
            <div
              className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="update-password" className={labelClass}>
                Nova palavra-passe
              </label>
              <input
                id="update-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className={inputClass}
                required
                minLength={6}
                autoFocus
                autoComplete="new-password"
              />
              <p className="mt-1 text-xs text-gray-400">Mínimo 6 caracteres</p>
            </div>
            <div>
              <label htmlFor="update-confirm" className={labelClass}>
                Confirmar palavra-passe
              </label>
              <input
                id="update-confirm"
                type="password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setError("");
                }}
                className={inputClass}
                required
                minLength={6}
                autoComplete="new-password"
              />
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
                "Guardar palavra-passe"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[14px] text-gray-600">
            <Link href="/auth/login" className="font-medium text-[#3C5E95] hover:underline">
              Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

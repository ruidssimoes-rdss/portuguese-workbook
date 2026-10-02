"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLogo } from "@/components/auth-ui";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "h-10 w-full rounded-lg border border-aula-border bg-white px-3 text-[13.5px] text-aula-text outline-none transition-colors placeholder:text-aula-text-4 focus:border-aula-accent";
const labelClass = "mb-1.5 block text-[12px] font-medium text-aula-text-2";

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
    <div className="flex min-h-dvh flex-col items-center justify-center bg-aula-canvas px-4 py-12">
      <div className="w-full max-w-[380px] mx-auto">
        <div className="rounded-2xl border border-aula-line bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <AuthLogo />
          <h1 className="mb-6 text-center text-[18px] font-semibold tracking-[-0.01em] text-aula-text">Nova palavra-passe</h1>

          {error && (
            <div
              className="mb-4 rounded-[10px] border border-[#F0C9BE] bg-[#FBE9E4] px-3.5 py-2.5 text-[12.5px] text-aula-overdue"
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
              <p className="mt-1 text-[11px] text-aula-text-3">Mínimo 6 caracteres</p>
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
              className="h-10 w-full rounded-lg bg-aula-accent text-[13.5px] font-medium text-white hover:bg-aula-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  A carregar…
                </>
              ) : (
                "Guardar palavra-passe"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-aula-text-3">
            <Link href="/auth/login" className="font-medium text-aula-accent">
              Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

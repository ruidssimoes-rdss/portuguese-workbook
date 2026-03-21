"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full px-3 py-2.5 text-[14px] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg outline-none focus:border-[rgba(0,0,0,0.12)] placeholder:text-[#9B9DA3] transition-colors";
const labelClass = "block text-[13px] font-medium text-[#111111] mb-1.5";

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-white">
      <div className="w-full max-w-[360px] mx-auto">
        <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 mb-3">
              <svg width="48" height="48" viewBox="0 0 350 350" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="350" height="350" rx="36" fill="#1B2B61"/>
                <path d="M126.085 90.8203C130.072 90.124 133.462 93.4698 133.462 97.6406V173.556C133.462 177.727 130.071 181.081 126.085 180.385C104.732 176.655 88.5 158.024 88.5 135.603C88.5002 113.182 104.732 94.5503 126.085 90.8203Z" fill="white" stroke="white"/>
                <path d="M130.089 221.852C131.873 221.486 133.462 222.993 133.462 224.961V256.338C133.462 258.31 131.87 259.831 130.089 259.467C121.343 257.675 114.764 249.935 114.764 240.659C114.764 231.384 121.343 223.643 130.089 221.852Z" fill="white" stroke="white"/>
                <path d="M261.035 173.638C261.514 177.688 258.161 181.064 254.001 181.064H142.028C137.862 181.064 134.45 177.683 134.928 173.638C138.741 141.38 165.527 116.404 197.981 116.404C230.436 116.404 257.222 141.38 261.035 173.638Z" fill="white" stroke="white"/>
                <path d="M127.588 188.129C129.83 186.059 133.462 187.649 133.462 190.7V213.678C133.462 215.611 131.895 217.178 129.962 217.178H104.913C101.713 217.178 100.191 213.24 102.558 211.088L112.958 201.633L112.961 201.63L127.588 188.129Z" fill="white" stroke="white"/>
                <path d="M195.026 216.457C197.174 218.605 197.174 222.087 195.026 224.235L193.047 226.214C190.9 228.362 187.417 228.362 185.269 226.214L172.217 213.161V193.647L195.026 216.457Z" fill="white" stroke="white"/>
                <path d="M148.408 216.457C146.26 218.605 146.26 222.087 148.408 224.235L150.387 226.214C152.535 228.362 156.017 228.362 158.165 226.214L171.217 213.161V193.647L148.408 216.457Z" fill="white" stroke="white"/>
                <path d="M253.792 260.357C253.792 260.357 253.792 242.301 253.792 224.244C253.792 183.774 171.717 174.999 171.717 174.999" stroke="white" strokeWidth="13"/>
              </svg>
            </div>
          </div>
          <p className="text-center text-[13px] text-[#9B9DA3] mb-6">
            Nova palavra-passe
          </p>

          {error && (
            <div
              className="mb-4 rounded-lg border-[0.5px] border-[rgba(220,38,38,0.2)] bg-[#fef2f2] p-3 text-[#dc2626] text-[12px]"
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
              <p className="mt-1 text-[11px] text-[#9B9DA3]">Mínimo 6 caracteres</p>
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
              className="w-full rounded-lg bg-[#111111] py-2.5 text-white font-medium text-[14px] hover:bg-[#333] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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

          <p className="mt-6 text-center text-[13px] text-[#9B9DA3]">
            <Link href="/auth/login" className="font-medium text-[#185FA5] hover:underline">
              Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

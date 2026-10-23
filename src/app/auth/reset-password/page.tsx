"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError } from "@/lib/auth-errors";
import {
  AuthError,
  AuthMobileLogo,
  AuthScreen,
  AuthSubmit,
  AuthTitle,
  SentMail,
  authInputClass,
  authLabelClass,
} from "@/components/auth/auth-screen";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo: `${window.location.origin}/auth/callback?type=recovery` }
      );
      if (resetError) {
        setError(mapAuthError(resetError));
        setLoading(false);
        return;
      }
      setSentEmail(email);
      setSuccess(true);
    } catch (err) {
      setError(mapAuthError(err instanceof Error ? { message: err.message } : undefined));
    }
    setLoading(false);
  };

  if (success) {
    return (
      <AuthScreen>
        <SentMail
          title="Verifica o teu email"
          body={
            <>
              Enviámos um link para redefinir a palavra-passe para <strong className="font-semibold text-[#1F1F1F]">{sentEmail}</strong>. Clica no link para escolher uma nova palavra-passe.
            </>
          }
        />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen>
      <AuthMobileLogo />
      <AuthTitle>Redefinir palavra-passe</AuthTitle>

      {error && <AuthError>{error}</AuthError>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reset-email" className={`mb-1.5 block ${authLabelClass}`}>
            Email
          </label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            className={authInputClass(false)}
            required
            autoFocus
            autoComplete="email"
          />
        </div>
        <AuthSubmit loading={loading} idle="Enviar link" busy="A carregar…" />
      </form>

      <p className="mt-6 text-center text-[13px] min-[744px]:text-[13px]">
        <Link href="/auth/login" className="font-medium text-aula-accent">
          Voltar ao login
        </Link>
      </p>
    </AuthScreen>
  );
}

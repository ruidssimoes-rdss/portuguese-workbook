"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError } from "@/lib/auth-errors";
import { pathAfterAuth } from "@/lib/post-auth";
import {
  AuthError,
  AuthMobileLogo,
  AuthScreen,
  AuthSubmit,
  AuthTitle,
  PasswordField,
} from "@/components/auth/auth-screen";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
      setError("A palavra-passe é demasiado fraca. Usa pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(mapAuthError(updateError));
        setLoading(false);
        return;
      }
      const dest = await pathAfterAuth("/");
      router.push(dest);
      router.refresh();
    } catch (err) {
      setError(mapAuthError(err instanceof Error ? { message: err.message } : undefined));
      setLoading(false);
    }
  };

  return (
    <AuthScreen>
      <AuthMobileLogo />
      <AuthTitle>Nova palavra-passe</AuthTitle>

      {error && <AuthError>{error}</AuthError>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordField
          id="update-password"
          label="Nova palavra-passe"
          value={password}
          onChange={(value) => {
            setPassword(value);
            setError("");
          }}
          autoComplete="new-password"
          hint="Mínimo 6 caracteres"
          autoFocus
          revealed={showPassword}
          onToggleReveal={() => setShowPassword((v) => !v)}
        />
        <PasswordField
          id="update-confirm"
          label="Confirmar palavra-passe"
          value={confirm}
          onChange={(value) => {
            setConfirm(value);
            setError("");
          }}
          autoComplete="new-password"
          revealed={showConfirm}
          onToggleReveal={() => setShowConfirm((v) => !v)}
        />
        <AuthSubmit loading={loading} idle="Guardar palavra-passe" busy="A carregar…" />
      </form>

      <p className="mt-6 text-center text-[13px]">
        <Link href="/auth/login" className="font-medium text-aula-accent">
          Voltar ao login
        </Link>
      </p>
    </AuthScreen>
  );
}

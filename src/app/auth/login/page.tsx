"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { isInvalidCredentials, mapAuthError } from "@/lib/auth-errors";
import { pathAfterAuth } from "@/lib/post-auth";
import {
  AuthError,
  AuthMobileLogo,
  AuthScreen,
  AuthSubmit,
  AuthTitle,
  PasswordField,
  authInputClass,
  authLabelClass,
} from "@/components/auth/auth-screen";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [dismissedUrlError, setDismissedUrlError] = useState(false);
  const [loading, setLoading] = useState(false);

  const urlError = (() => {
    const err = searchParams.get("error");
    const errorCode = searchParams.get("error_code");
    const errorDescription = searchParams.get("error_description");
    if (!err && !errorCode) return "";
    return mapAuthError({
      message: errorDescription || err || "",
      code: errorCode || err || "",
    });
  })();
  const error = formError || (dismissedUrlError ? "" : urlError);

  useEffect(() => {
    if (!searchParams.get("error") && !searchParams.get("error_code")) return;
    const next = new URLSearchParams(searchParams.toString());
    next.delete("error");
    next.delete("error_code");
    next.delete("error_description");
    const query = next.toString();
    window.history.replaceState({}, "", query ? `${window.location.pathname}?${query}` : window.location.pathname);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setDismissedUrlError(true);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setFormError(mapAuthError(signInError));
        setLoading(false);
        return;
      }
      const dest = await pathAfterAuth(searchParams.get("next"));
      router.push(dest);
      router.refresh();
    } catch (err) {
      setFormError(mapAuthError(err instanceof Error ? { message: err.message } : undefined));
      setLoading(false);
    }
  };

  const credentialsError = isInvalidCredentials(error);

  return (
    <AuthScreen>
      <AuthMobileLogo />
      <AuthTitle>Olá outra vez</AuthTitle>

      {error && <AuthError>{error}</AuthError>}

      <GoogleSignInButton />

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-aula-line" />
        <span className="text-[11.5px] text-aula-text-3 min-[744px]:text-[12px] min-[744px]:text-[#5A5A57]">ou</span>
        <div className="h-px flex-1 bg-aula-line" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className={`mb-1.5 block ${authLabelClass}`}>
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFormError("");
              setDismissedUrlError(true);
            }}
            className={authInputClass(false)}
            required
            autoFocus
            autoComplete="email"
          />
        </div>
        <div>
          <PasswordField
            id="login-password"
            label="Palavra-passe"
            value={password}
            onChange={(value) => {
            setPassword(value);
            setFormError("");
            setDismissedUrlError(true);
            }}
            autoComplete="current-password"
            invalid={credentialsError}
            revealed={showPassword}
            onToggleReveal={() => setShowPassword((v) => !v)}
            labelExtra={
              <Link href="/auth/reset-password" className="hidden text-[12px] font-medium text-[#1B2B61] min-[744px]:inline">
                Esqueceste a palavra-passe?
              </Link>
            }
          />
          <p className="mt-1.5 text-[13px] min-[744px]:hidden">
            <Link href="/auth/reset-password" className="text-aula-text-3 hover:text-aula-accent">
              Esqueceste a palavra-passe?
            </Link>
          </p>
        </div>
        <AuthSubmit loading={loading} idle="Entrar" busy="A carregar…" />
      </form>

      <p className="mt-6 text-center text-[13px] text-aula-text-3 min-[744px]:text-[13px] min-[744px]:text-[#5A5A57]">
        Ainda não tens conta?{" "}
        <Link href="/auth/signup" className="font-medium text-aula-accent">
          Criar conta
        </Link>
      </p>
    </AuthScreen>
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { mapAuthError } from "@/lib/auth-errors";
import {
  AuthError,
  AuthMobileLogo,
  AuthScreen,
  AuthSubmit,
  AuthTitle,
  PasswordField,
  SentMail,
  authInputClass,
  authLabelClass,
} from "@/components/auth/auth-screen";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signUpError) {
        setError(mapAuthError(signUpError));
        setLoading(false);
        return;
      }
      // Supabase returns an empty identities list when the email is already registered
      // and confirmation is on, instead of an error.
      if (data.user && (data.user.identities?.length ?? 0) === 0) {
        setError(mapAuthError({ code: "user_already_exists", message: "User already registered" }));
        setLoading(false);
        return;
      }
      if (data.session) {
        router.push("/onboarding");
        router.refresh();
        return;
      }
      setRegisteredEmail(email);
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
              Enviámos um link de confirmação para <strong className="font-semibold text-[#1F1F1F]">{registeredEmail}</strong>. Clica no link para ativar a tua conta.
            </>
          }
        />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen>
      <AuthMobileLogo />
      <AuthTitle>Criar conta</AuthTitle>

      {error && <AuthError>{error}</AuthError>}

      <GoogleSignInButton />

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-aula-line" />
        <span className="text-[11.5px] text-aula-text-3 min-[744px]:text-[12px] min-[744px]:text-[#5A5A57]">ou</span>
        <div className="h-px flex-1 bg-aula-line" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="signup-name" className={`mb-1.5 block ${authLabelClass}`}>
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
            className={authInputClass(false)}
            required
            autoFocus
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="signup-email" className={`mb-1.5 block ${authLabelClass}`}>
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
            className={authInputClass(false)}
            required
            autoComplete="email"
          />
        </div>
        <PasswordField
          id="signup-password"
          label="Palavra-passe"
          value={password}
          onChange={(value) => {
            setPassword(value);
            setError("");
          }}
          autoComplete="new-password"
          hint="Mínimo 6 caracteres"
          revealed={showPassword}
          onToggleReveal={() => setShowPassword((v) => !v)}
        />
        <AuthSubmit loading={loading} idle="Criar conta" busy="A carregar…" />
      </form>

      <p className="mt-6 text-center text-[13px] text-aula-text-3 min-[744px]:text-[#5A5A57]">
        Já tens conta?{" "}
        <Link href="/auth/login" className="font-medium text-aula-accent">
          Entrar
        </Link>
      </p>
    </AuthScreen>
  );
}

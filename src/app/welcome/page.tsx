"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { hasCompletedOnboarding } from "@/lib/onboarding-service";
import { AuthMobileLogo, AuthScreen } from "@/components/auth/auth-screen";

export default function WelcomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [completed, setCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    let cancel = false;
    hasCompletedOnboarding().then((done) => {
      if (cancel) return;
      if (done) router.replace("/");
      else setCompleted(false);
    });
    return () => {
      cancel = true;
    };
  }, [user, loading, router]);

  const signedIn = !!user && completed === false;

  return (
    <AuthScreen>
      <AuthMobileLogo />
      <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A5A57] min-[744px]:text-left">
        Começar
      </p>
      <h1 className="mb-3 text-center text-[18px] font-semibold tracking-[-0.01em] text-aula-text min-[744px]:text-left min-[744px]:text-[22px] min-[744px]:tracking-[-0.02em]">
        {signedIn ? "A tua conta já está pronta" : "Entra para a Aula"}
      </h1>
      <p className="text-center text-[13px] leading-relaxed text-aula-text-2 min-[744px]:text-left min-[744px]:text-[14px] min-[744px]:text-[#5A5A57]">
        {signedIn
          ? "Faltam cinco passos: porque aprendes, o nível, o ritmo, o objetivo e o nome. Depois disso a Aula abre em Hoje."
          : "Cria uma conta, confirma o email e diz-nos porque queres aprender. Quem já fez isto entra direto."}
      </p>

      {signedIn ? (
        <Link
          href="/onboarding"
          className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-aula-accent text-[13.5px] font-medium text-white transition-colors hover:bg-aula-accent-hover min-[744px]:h-11 min-[744px]:rounded-full min-[744px]:text-[14px]"
        >
          Continuar
          <ArrowRight size={16} strokeWidth={1.75} className="hidden min-[744px]:block" aria-hidden />
        </Link>
      ) : (
        <Link
          href="/auth/signup"
          className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-aula-accent text-[13.5px] font-medium text-white transition-colors hover:bg-aula-accent-hover min-[744px]:h-11 min-[744px]:rounded-full min-[744px]:text-[14px]"
        >
          Criar conta
          <ArrowRight size={16} strokeWidth={1.75} className="hidden min-[744px]:block" aria-hidden />
        </Link>
      )}

      {!signedIn && (
        <p className="mt-6 text-center text-[13px] text-aula-text-3 min-[744px]:text-[#5A5A57]">
          Já tens conta?{" "}
          <Link href="/auth/login" className="font-medium text-aula-accent">
            Entrar
          </Link>
        </p>
      )}
    </AuthScreen>
  );
}

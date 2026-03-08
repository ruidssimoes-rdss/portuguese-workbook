"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { hasCompletedOnboarding } from "@/lib/onboarding-service";

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setCheckingOnboarding(false);
      return;
    }
    hasCompletedOnboarding().then((completed) => {
      if (!completed) {
        router.push("/onboarding");
      } else {
        setCheckingOnboarding(false);
      }
    });
  }, [user, loading, router]);

  if (loading || checkingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-[15px] text-[#9CA3AF]">A carregar...</p>
      </div>
    );
  }

  return <>{children}</>;
}

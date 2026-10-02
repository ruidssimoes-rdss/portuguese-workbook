import { AppLogo } from "@/components/layout/sidebar";

/** Logo + wordmark at the top of the auth cards. */
export function AuthLogo() {
  return (
    <div className="mb-6 flex items-center justify-center gap-2">
      <AppLogo size={28} />
      <span className="text-[17px] font-semibold tracking-[-0.02em] text-aula-text">Aula</span>
    </div>
  );
}

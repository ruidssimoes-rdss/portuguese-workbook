/** Official lockup: navy mark plus the outlined Geist Semibold wordmark. */
export function AuthLogo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- official lockup SVG, not redrawn
    <img
      src="/brand/aula-lockup-transparent-navy.svg"
      alt="Aula"
      width={117}
      height={56}
      draggable={false}
      className="mx-auto mb-2 block h-14 w-auto"
    />
  );
}

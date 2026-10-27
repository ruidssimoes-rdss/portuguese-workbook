/** Elísio's face: the Galo Gordo head. */
export function ElisioAvatar({ size = 20 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/elisio/galo-head.svg" width={size} height={size} alt="" aria-hidden className="shrink-0 rounded-full" />;
}

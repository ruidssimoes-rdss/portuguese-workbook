"use client";

export function ScrollToTopLink() {
  return (
    <button
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-8 text-[13.5px] font-medium text-aula-accent transition-opacity hover:opacity-90"
    >
      Join the waitlist
    </button>
  );
}

import type { BlocoExample } from "../smart-bloco.types";

interface ExampleBlockProps {
  example: BlocoExample;
}

export function ExampleBlock({ example }: ExampleBlockProps) {
  return (
    <div
      className="rounded-[var(--bloco-radius-example)] p-[var(--bloco-example-padding)] border"
      style={{
        backgroundColor: "var(--color-bloco-surface-recessed)",
        borderColor: "var(--color-bloco-border-content)",
      }}
    >
      <p className="font-[family-name:var(--font-content)] text-[12px] font-normal text-[var(--color-bloco-text)] leading-normal">
        &ldquo;{example.portuguese}&rdquo;
      </p>
      <p
        className="font-[family-name:var(--font-content)] text-[12px] font-normal italic leading-normal mt-[var(--bloco-example-gap)]"
        style={{ color: "var(--color-bloco-primary)" }}
      >
        {example.english}
      </p>
    </div>
  );
}

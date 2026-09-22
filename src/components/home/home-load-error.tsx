"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Shown when the server could not load home data; retry re-renders the server page. */
export function HomeLoadError({ message }: { message: string }) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-3 px-4 py-3 bg-[#FAEEDA] border-[0.5px] border-[#E8C98A] rounded-lg mb-8"
    >
      <div>
        <p className="text-[13px] font-medium text-[#854F0B]">Something went wrong</p>
        <p className="text-[12px] text-[#854F0B] mt-0.5">{message}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          setRetrying(true);
          router.refresh();
        }}
        disabled={retrying}
        className="shrink-0 px-3 py-1.5 text-[12px] font-medium text-[#854F0B] border-[0.5px] border-[#E8C98A] rounded-md hover:bg-[#F5E3C0] transition-colors cursor-pointer disabled:opacity-60"
      >
        {retrying ? "Retrying…" : "Retry"}
      </button>
    </div>
  );
}

import Link from "next/link";
import { patterns, spacing } from "@/lib/design-tokens";

export default function NotFound() {
  return (
    <div className={`${spacing.pageNarrow} py-24 text-center`}>
      <p className="text-[48px] font-bold text-[#111827]">404</p>
      <p className="text-[16px] font-semibold text-[#111827] mt-2">
        Page not found
      </p>
      <p className="text-[13px] text-[#6B7280] mt-1">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className={`${patterns.button.primary} inline-flex items-center h-10 px-6 mt-6`}
      >
        Back to home
      </Link>
    </div>
  );
}

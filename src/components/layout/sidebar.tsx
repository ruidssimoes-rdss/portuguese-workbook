"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  BookMarked,
  ClipboardList,
  Type,
  Globe,
  Activity,
  PenLine,
  Calendar,
  Settings,
  BookOpenCheck,
} from "lucide-react";

const navSections = [
  {
    label: "Learn",
    items: [
      { href: "/", icon: Home, label: "Home" },
      { href: "/lessons", icon: BookOpen, label: "Lessons" },
      { href: "/vocabulary", icon: BookMarked, label: "Vocabulary" },
      { href: "/grammar", icon: ClipboardList, label: "Grammar" },
      { href: "/conjugations", icon: Type, label: "Conjugations" },
      { href: "/culture", icon: Globe, label: "Culture" },
    ],
  },
  {
    label: "You",
    items: [
      { href: "/progress", icon: Activity, label: "Progress" },
      { href: "/notes", icon: PenLine, label: "Notes" },
      { href: "/calendar", icon: Calendar, label: "Calendar" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden md:flex w-[220px] min-w-[220px] border-r-[0.5px] border-[rgba(0,0,0,0.06)] flex-col py-4 bg-[#F7F7F5] h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-4 pb-5 flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-[#E6F1FB] flex items-center justify-center">
          <span className="text-[11px] font-medium text-[#185FA5]">AP</span>
        </div>
        <span className="text-[14px] font-medium text-[#111111] tracking-[-0.01em]">
          Aula PT
        </span>
      </div>

      {/* Nav sections */}
      <nav className="px-2 flex-1">
        {navSections.map((section, i) => (
          <div key={section.label}>
            {i > 0 && (
              <div className="h-px bg-[rgba(0,0,0,0.06)] mx-2 my-3" />
            )}
            <div className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#9B9DA3] px-2 pb-2">
              {section.label}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] mb-[1px] transition-colors duration-100 ${
                    active
                      ? "bg-[rgba(0,0,0,0.05)] text-[#111111] font-medium"
                      : "text-[#6C6B71] hover:bg-[rgba(0,0,0,0.03)]"
                  }`}
                >
                  <Icon size={16} strokeWidth={1.5} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 flex items-center gap-2 mt-2">
        <div className="w-6 h-6 rounded-full bg-[#E6F1FB] flex items-center justify-center">
          <span className="text-[10px] font-medium text-[#185FA5]">K</span>
        </div>
        <span className="text-[12px] text-[#6C6B71]">Kim</span>
      </div>
    </aside>
  );
}

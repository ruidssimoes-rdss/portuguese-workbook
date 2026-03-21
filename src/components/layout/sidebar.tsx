"use client";

import { useState, useRef, useEffect } from "react";
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
  LogIn,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";

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
      { href: "/guide", icon: BookOpenCheck, label: "Guide" },
    ],
  },
  {
    label: "You",
    items: [
      { href: "/progress", icon: Activity, label: "Progress" },
      { href: "/notes", icon: PenLine, label: "Notes" },
      { href: "/calendar", icon: Calendar, label: "Calendar" },
      { href: "/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    window.location.href = "/";
  };

  const displayName =
    user?.user_metadata?.display_name || user?.email || null;
  const initial =
    displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?";

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

      {/* User section */}
      {!loading && user ? (
        <div className="px-2 mt-2">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[rgba(0,0,0,0.03)] transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-[#E6F1FB] flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-medium text-[#185FA5]">
                  {initial}
                </span>
              </div>
              <span className="text-[12px] text-[#6C6B71] truncate flex-1 text-left">
                {displayName}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute bottom-full left-2 right-2 mb-1 bg-white border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg py-1 shadow-sm">
                <Link
                  href="/settings"
                  className="block px-3 py-1.5 text-[12px] text-[#6C6B71] hover:bg-[#F7F7F5] transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-1.5 text-[12px] text-[#6C6B71] hover:bg-[#F7F7F5] transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      ) : !loading ? (
        <div className="px-2 mt-2">
          <Link
            href="/auth/login"
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] text-[#6C6B71] hover:bg-[rgba(0,0,0,0.03)] transition-colors"
          >
            <LogIn size={16} strokeWidth={1.5} />
            Sign in
          </Link>
        </div>
      ) : null}
    </aside>
  );
}

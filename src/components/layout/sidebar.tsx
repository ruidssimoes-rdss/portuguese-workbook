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
  Search,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { SearchModal } from "@/components/search-modal";

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
  const [searchOpen, setSearchOpen] = useState(false);
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

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
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
    <>
      <aside className="hidden md:flex w-[220px] min-w-[220px] border-r-[0.5px] border-[rgba(0,0,0,0.06)] flex-col py-4 bg-[#F7F7F5] h-dvh sticky top-0 overflow-y-auto">
        {/* Logo */}
        <div className="px-4 pb-5 flex items-center gap-2">
          <div className="w-7 h-7 flex-shrink-0">
            <svg width="28" height="28" viewBox="0 0 350 350" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="350" height="350" rx="36" fill="#1B2B61"/>
              <path d="M126.085 90.8203C130.072 90.124 133.462 93.4698 133.462 97.6406V173.556C133.462 177.727 130.071 181.081 126.085 180.385C104.732 176.655 88.5 158.024 88.5 135.603C88.5002 113.182 104.732 94.5503 126.085 90.8203Z" fill="white" stroke="white"/>
              <path d="M130.089 221.852C131.873 221.486 133.462 222.993 133.462 224.961V256.338C133.462 258.31 131.87 259.831 130.089 259.467C121.343 257.675 114.764 249.935 114.764 240.659C114.764 231.384 121.343 223.643 130.089 221.852Z" fill="white" stroke="white"/>
              <path d="M261.035 173.638C261.514 177.688 258.161 181.064 254.001 181.064H142.028C137.862 181.064 134.45 177.683 134.928 173.638C138.741 141.38 165.527 116.404 197.981 116.404C230.436 116.404 257.222 141.38 261.035 173.638Z" fill="white" stroke="white"/>
              <path d="M127.588 188.129C129.83 186.059 133.462 187.649 133.462 190.7V213.678C133.462 215.611 131.895 217.178 129.962 217.178H104.913C101.713 217.178 100.191 213.24 102.558 211.088L112.958 201.633L112.961 201.63L127.588 188.129Z" fill="white" stroke="white"/>
              <path d="M195.026 216.457C197.174 218.605 197.174 222.087 195.026 224.235L193.047 226.214C190.9 228.362 187.417 228.362 185.269 226.214L172.217 213.161V193.647L195.026 216.457Z" fill="white" stroke="white"/>
              <path d="M148.408 216.457C146.26 218.605 146.26 222.087 148.408 224.235L150.387 226.214C152.535 228.362 156.017 228.362 158.165 226.214L171.217 213.161V193.647L148.408 216.457Z" fill="white" stroke="white"/>
              <path d="M253.792 260.357C253.792 260.357 253.792 242.301 253.792 224.244C253.792 183.774 171.717 174.999 171.717 174.999" stroke="white" strokeWidth="13"/>
            </svg>
          </div>
          <span className="text-[14px] font-medium text-[#111111] tracking-[-0.01em]">
            Aula PT
          </span>
        </div>

        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="mx-2 mb-3 flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] text-[#9B9DA3] hover:bg-[rgba(0,0,0,0.03)] transition-colors w-[calc(100%-16px)]"
        >
          <Search size={14} strokeWidth={1.5} />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="text-[10px] text-[#9B9DA3] bg-[rgba(0,0,0,0.04)] px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>

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
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useSidebar } from "./sidebar-context";
import {
  Home, BookOpen, Languages, FileText, PenTool, Globe,
  BarChart3, StickyNote, Calendar, Settings, HelpCircle,
  PanelLeftClose, PanelLeft, Menu, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ── Nav config ────────────────────────────────────────────

interface NavItem { label: string; icon: LucideIcon; href: string }

const primaryNav: NavItem[] = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Lessons", icon: BookOpen, href: "/lessons" },
  { label: "Vocabulary", icon: Languages, href: "/vocabulary" },
  { label: "Grammar", icon: FileText, href: "/grammar" },
  { label: "Conjugate", icon: PenTool, href: "/conjugations" },
  { label: "Culture", icon: Globe, href: "/culture" },
];

const secondaryNav: NavItem[] = [
  { label: "Progress", icon: BarChart3, href: "/progress" },
  { label: "Notes", icon: StickyNote, href: "/notes" },
  { label: "Calendar", icon: Calendar, href: "/calendar" },
];

const bottomNav: NavItem[] = [
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "Guide", icon: HelpCircle, href: "/guide" },
];

// ── Nav item ──────────────────────────────────────────────

function SidebarNavItem({ item, expanded }: { item: NavItem; expanded: boolean }) {
  const pathname = usePathname();
  const isActive = item.href === "/"
    ? pathname === "/"
    : pathname === item.href || pathname.startsWith(item.href + "/");

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 py-2.5 rounded-lg transition-colors duration-150 relative ${
        expanded ? "px-3" : "justify-center px-0"
      } ${
        isActive
          ? "bg-[#F3F4F6] text-[#111827] font-medium"
          : "text-[#9CA3AF] hover:bg-[#F9FAFB] hover:text-[#6B7280]"
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-[#003399] rounded-r" />
      )}
      <Icon size={18} className="shrink-0" />
      {expanded && <span className={`text-[14px] transition-opacity duration-150 ${expanded ? "opacity-100 delay-75" : "opacity-0"}`}>{item.label}</span>}
    </Link>
  );
}

// ── Divider ───────────────────────────────────────────────

function SidebarDivider() {
  return <div className="h-px bg-[#F3F4F6] my-3" />;
}

// ── User badge ────────────────────────────────────────────

function UserBadge({ expanded }: { expanded: boolean }) {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className={`flex items-center gap-3 ${expanded ? "" : "justify-center"}`}>
      <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0">
        <span className="text-[13px] font-medium text-[#6B7280]">{initial}</span>
      </div>
      {expanded && (
        <span className="text-[13px] text-[#6B7280] truncate">{displayName}</span>
      )}
    </div>
  );
}

// ── Desktop Sidebar ───────────────────────────────────────

function DesktopSidebar() {
  const { isExpanded, toggle } = useSidebar();
  const w = isExpanded ? "w-[240px]" : "w-[60px]";

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-40 bg-white border-r border-[#F3F4F6] ${w} transition-all duration-200 ease-out flex-col justify-between p-4 hidden lg:flex`}
    >
      {/* Top */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className={`flex items-center ${isExpanded ? "justify-between" : "justify-center"} mb-1`}>
          {isExpanded ? (
            <span className="text-[16px] font-semibold text-[#111827]">Aula PT</span>
          ) : (
            <span className="text-[14px] font-semibold text-[#111827]">AP</span>
          )}
          <button
            onClick={toggle}
            className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors cursor-pointer p-1"
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isExpanded ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>
        </div>

        <SidebarDivider />

        {/* Primary nav */}
        <nav className="space-y-0.5">
          {primaryNav.map((item) => (
            <SidebarNavItem key={item.href} item={item} expanded={isExpanded} />
          ))}
        </nav>

        <SidebarDivider />

        {/* Secondary nav */}
        <nav className="space-y-0.5">
          {secondaryNav.map((item) => (
            <SidebarNavItem key={item.href} item={item} expanded={isExpanded} />
          ))}
        </nav>

        <SidebarDivider />

        {/* Bottom nav */}
        <nav className="space-y-0.5">
          {bottomNav.map((item) => (
            <SidebarNavItem key={item.href} item={item} expanded={isExpanded} />
          ))}
        </nav>
      </div>

      {/* User */}
      <div>
        <SidebarDivider />
        <UserBadge expanded={isExpanded} />
      </div>
    </aside>
  );
}

// ── Mobile Top Bar + Overlay ──────────────────────────────

function MobileTopBar() {
  const { openMobile } = useSidebar();

  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#F3F4F6] z-40 flex items-center px-4 lg:hidden">
      <button
        onClick={openMobile}
        className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors cursor-pointer"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      <span className="text-[15px] font-semibold text-[#111827] ml-3">Aula PT</span>
    </div>
  );
}

function MobileOverlay() {
  const { isMobileOpen, closeMobile } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={closeMobile}
      />
      {/* Sidebar panel */}
      <aside className="fixed left-0 top-0 h-full w-[240px] bg-white z-50 p-4 flex flex-col justify-between sidebar-slide-in lg:hidden">
        {/* Close button */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[16px] font-semibold text-[#111827]">Aula PT</span>
            <button
              onClick={closeMobile}
              className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors cursor-pointer p-1"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <SidebarDivider />

          <nav className="space-y-0.5" onClick={closeMobile}>
            {primaryNav.map((item) => (
              <SidebarNavItem key={item.href} item={item} expanded />
            ))}
          </nav>

          <SidebarDivider />

          <nav className="space-y-0.5" onClick={closeMobile}>
            {secondaryNav.map((item) => (
              <SidebarNavItem key={item.href} item={item} expanded />
            ))}
          </nav>

          <SidebarDivider />

          <nav className="space-y-0.5" onClick={closeMobile}>
            {bottomNav.map((item) => (
              <SidebarNavItem key={item.href} item={item} expanded />
            ))}
          </nav>
        </div>

        <div>
          <SidebarDivider />
          <UserBadge expanded />
        </div>
      </aside>
    </>
  );
}

// ── Main Export ────────────────────────────────────────────

export function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileTopBar />
      <MobileOverlay />
    </>
  );
}

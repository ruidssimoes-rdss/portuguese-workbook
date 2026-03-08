"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";

const STORAGE_KEY = "aula-pt-theme";

export type ThemeMode = "light" | "dark" | "system";

function applyTheme(mode: string): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (mode === "system") {
    const prefersDark =
      typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.setAttribute("data-theme", prefersDark ? "dark" : "light");
  } else {
    root.setAttribute("data-theme", mode);
  }
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // ignore
  }
}

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<ThemeMode>("system");

  const setTheme = useCallback(
    async (mode: ThemeMode) => {
      setThemeState(mode);
      applyTheme(mode);
      if (user?.id) {
        const supabase = createClient();
        await supabase
          .from("user_settings")
          .upsert(
            { user_id: user.id, theme: mode, updated_at: new Date().toISOString() },
            { onConflict: "user_id" }
          );
      }
    },
    [user?.id]
  );

  useEffect(() => {
    const stored = (typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null) || "system";
    setThemeState(stored as ThemeMode);
    applyTheme(stored);
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();
    let cancelled = false;
    supabase
      .from("user_settings")
      .select("theme")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          await supabase.from("user_settings").insert({
            user_id: user.id,
            pronunciation_speed: 0.85,
            show_phonetics: true,
            daily_goal: 10,
            theme: "system",
            show_translations: true,
            preferred_study_time: "evening",
          });
          return;
        }
        const serverTheme = (data.theme as string) || "system";
        setThemeState(serverTheme as ThemeMode);
        applyTheme(serverTheme);
        try {
          localStorage.setItem(STORAGE_KEY, serverTheme);
        } catch {
          // ignore
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import type { Profile, UserSettings } from "@/types/database";

const SPEED_OPTIONS = [
  { value: 0.6, label: "Lento" },
  { value: 0.85, label: "Normal" },
  { value: 1, label: "Rápido" },
];

const DAILY_GOAL_OPTIONS = [5, 10, 15, 20];

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [pronunciationSpeed, setPronunciationSpeed] = useState(0.85);
  const [showPhonetics, setShowPhonetics] = useState(true);
  const [dailyGoal, setDailyGoal] = useState(10);

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();

    (async () => {
      const [profileRes, settingsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("user_settings").select("*").eq("user_id", user.id).single(),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data as Profile);
        setDisplayName(profileRes.data.display_name ?? "");
      }
      if (settingsRes.data) {
        setSettings(settingsRes.data as UserSettings);
        setPronunciationSpeed(settingsRes.data.pronunciation_speed ?? 0.85);
        setShowPhonetics(settingsRes.data.show_phonetics ?? true);
        setDailyGoal(settingsRes.data.daily_goal ?? 10);
      } else if (!settingsRes.error || settingsRes.error.code !== "PGRST116") {
        setPronunciationSpeed(0.85);
        setShowPhonetics(true);
        setDailyGoal(10);
      }
      setLoading(false);
    })();
  }, [user?.id]);

  const saveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName || null, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "ok", text: "Perfil guardado." });
    }
  };

  const saveSettings = async () => {
    if (!user?.id) return;
    setSaving(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: user.id,
          pronunciation_speed: pronunciationSpeed,
          show_phonetics: showPhonetics,
          daily_goal: dailyGoal,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    setSaving(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "ok", text: "Definições guardadas." });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <>
        <Topbar />
        <ProtectedRoute>
          <main className="max-w-[640px] mx-auto px-4 md:px-6 py-12">
            <p className="text-text-2">A carregar...</p>
          </main>
        </ProtectedRoute>
      </>
    );
  }

  return (
    <>
      <Topbar />
      <ProtectedRoute>
        <main className="max-w-[640px] mx-auto px-4 md:px-6 py-12">
          <h1 className="text-[22px] font-bold tracking-tight text-text">Definições</h1>

          {message && (
            <div
              className={`mt-4 rounded-lg border p-3 text-sm ${
                message.type === "ok"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-text mb-3">Perfil</h2>
            <div className="rounded-[14px] border border-[#E9E9E9] bg-white p-5 space-y-4">
              <div>
                <label htmlFor="display-name" className="block text-sm font-medium text-[#374151] mb-1">
                  Nome
                </label>
                <input
                  id="display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-lg border border-[#E9E9E9] px-4 py-3 text-base focus:ring-2 focus:ring-[#3C5E95] focus:border-[#3C5E95] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Email</label>
                <p className="text-[#6B7280] text-[15px]">{user?.email ?? "—"}</p>
              </div>
              <button
                type="button"
                onClick={saveProfile}
                disabled={saving}
                className="rounded-lg bg-[#3C5E95] px-4 py-2 text-white text-sm font-medium hover:bg-[#2E4A75] disabled:opacity-60"
              >
                {saving ? "A guardar..." : "Guardar perfil"}
              </button>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-text mb-3">Preferências de aprendizagem</h2>
            <div className="rounded-[14px] border border-[#E9E9E9] bg-white p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Velocidade da pronúncia
                </label>
                <select
                  value={pronunciationSpeed}
                  onChange={(e) => setPronunciationSpeed(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#E9E9E9] px-4 py-3 text-base focus:ring-2 focus:ring-[#3C5E95] focus:border-[#3C5E95] outline-none"
                >
                  {SPEED_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#374151]">Mostrar fonética</label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showPhonetics}
                  onClick={() => setShowPhonetics((v) => !v)}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors ${
                    showPhonetics ? "bg-[#3C5E95] border-[#3C5E95]" : "bg-[#E5E7EB] border-[#E9E9E9]"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      showPhonetics ? "translate-x-5" : "translate-x-0.5"
                    }`}
                    style={{ marginTop: 2 }}
                  />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Objetivo diário (palavras)</label>
                <select
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#E9E9E9] px-4 py-3 text-base focus:ring-2 focus:ring-[#3C5E95] focus:border-[#3C5E95] outline-none"
                >
                  {DAILY_GOAL_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={saveSettings}
                disabled={saving}
                className="rounded-lg bg-[#3C5E95] px-4 py-2 text-white text-sm font-medium hover:bg-[#2E4A75] disabled:opacity-60"
              >
                {saving ? "A guardar..." : "Guardar preferências"}
              </button>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-text mb-3">Conta</h2>
            <div className="rounded-[14px] border border-[#E9E9E9] bg-white p-5 space-y-3">
              <p>
                <Link
                  href="/auth/update-password"
                  className="text-[#3C5E95] text-sm font-medium hover:underline"
                >
                  Alterar palavra-passe
                </Link>
              </p>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg border border-[#E9E9E9] px-4 py-2 text-sm font-medium text-text-2 hover:bg-[#FAFAFA]"
              >
                Sair
              </button>
              <p className="text-sm text-[#6B7280] pt-2">
                Para apagar a tua conta, contacta-nos.
              </p>
            </div>
          </section>
        </main>
      </ProtectedRoute>
    </>
  );
}

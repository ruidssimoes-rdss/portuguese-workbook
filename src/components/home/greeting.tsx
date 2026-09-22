"use client";

import { useSyncExternalStore } from "react";

function greetingFor(hour: number): string {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

const subscribe = () => () => {};
const getSnapshot = () => greetingFor(new Date().getHours());
const getServerSnapshot = () => "Olá";

/** Time-of-day greeting in the viewer's local time (the server does not know it). */
export function Greeting({ name }: { name: string | null }) {
  const greeting = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return <>{name ? `${greeting}, ${name}` : greeting}</>;
}

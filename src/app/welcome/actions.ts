"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

type WaitlistResult =
  | { success: true }
  | { success: false; error: string };

// Simple in-memory rate limiter (production would use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 3; // 3 submissions per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

export async function submitWaitlist(formData: FormData): Promise<WaitlistResult> {
  try {
    // Get IP for rate limiting
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return {
        success: false,
        error: "Too many requests. Please wait a moment and try again.",
      };
    }

    // Check honeypot
    const honeypot = formData.get("website");
    if (honeypot && typeof honeypot === "string" && honeypot.trim() !== "") {
      // Silently reject bot submissions
      return { success: true };
    }

    // Validate email
    const email = formData.get("email");
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    // Validate consent
    const consent = formData.get("consent");
    if (consent !== "on") {
      return { success: false, error: "You must agree to receive updates." };
    }

    // Get level (optional)
    const level = formData.get("level");
    const levelValue = level && typeof level === "string" && level.trim() !== "" ? level : null;

    // Insert into database
    const supabase = await createClient();
    const { error: dbError } = await supabase.from("waitlist").insert({
      email: email.toLowerCase().trim(),
      level: levelValue,
      consent_at: new Date().toISOString(),
      source: "welcome-page",
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      // Check for duplicate email (unique constraint violation)
      if (dbError.code === "23505") {
        // Return success message even for duplicates (security best practice)
        return { success: true };
      }

      console.error("Waitlist submission error:", dbError);
      return {
        success: false,
        error: "Unable to join the waitlist. Please try again later.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Waitlist submission error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

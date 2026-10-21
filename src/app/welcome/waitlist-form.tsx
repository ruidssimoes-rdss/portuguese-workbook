"use client";

import { useState, useRef } from "react";
import { submitWaitlist } from "./actions";

type FormState = "idle" | "submitting" | "success" | "error";

export function WaitlistForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await submitWaitlist(formData);

    if (result.success) {
      setState("success");
      formRef.current?.reset();
    } else {
      setState("error");
      setError(result.error || "Something went wrong. Please try again.");
    }
  }

  if (state === "success") {
    return (
      <div className="text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E1F5EE] mx-auto">
          <svg
            className="h-6 w-6 text-[#1F7A68]"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mb-2 text-[15px] font-semibold text-aula-text">You're on the list!</h3>
        <p className="text-[13px] text-aula-text-2">
          We'll send you updates as new features and lessons become available.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-2 block text-left text-[12.5px] font-medium text-aula-text">
            Email address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            disabled={state === "submitting"}
            className="h-10 w-full rounded-lg border border-aula-border bg-white px-3.5 text-[13.5px] text-aula-text transition-colors focus:border-aula-accent focus:outline-none focus:ring-2 focus:ring-aula-accent focus:ring-opacity-20 disabled:opacity-50"
            placeholder="your.email@example.com"
          />
        </div>

        {/* Level (optional) */}
        <div>
          <label htmlFor="level" className="mb-2 block text-left text-[12.5px] font-medium text-aula-text">
            Current level <span className="font-normal text-aula-text-3">(optional)</span>
          </label>
          <select
            id="level"
            name="level"
            disabled={state === "submitting"}
            className="h-10 w-full rounded-lg border border-aula-border bg-white px-3.5 text-[13.5px] text-aula-text transition-colors focus:border-aula-accent focus:outline-none focus:ring-2 focus:ring-aula-accent focus:ring-opacity-20 disabled:opacity-50"
          >
            <option value="">Select your level</option>
            <option value="beginner">Beginner (never studied Portuguese)</option>
            <option value="some-basics">Some basics (know a few words)</option>
            <option value="intermediate">Intermediate (can have simple conversations)</option>
          </select>
        </div>

        {/* Consent checkbox */}
        <div className="flex items-start gap-2.5">
          <input
            type="checkbox"
            id="consent"
            name="consent"
            required
            disabled={state === "submitting"}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-aula-border text-aula-accent transition-colors focus:ring-2 focus:ring-aula-accent focus:ring-opacity-20 disabled:opacity-50"
          />
          <label htmlFor="consent" className="text-left text-[12px] leading-relaxed text-aula-text-2">
            I agree to receive updates about Aula PT. See our{" "}
            <a href="/privacy" className="text-aula-accent hover:underline">
              privacy policy
            </a>
            .
          </label>
        </div>

        {/* Honeypot field (hidden from users, catches bots) */}
        <input
          type="text"
          name="website"
          autoComplete="off"
          tabIndex={-1}
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
          aria-hidden="true"
        />

        {/* Error message */}
        {state === "error" && error && (
          <div className="rounded-lg bg-[#FBE9E4] px-4 py-3 text-[12.5px] text-[#B94A32]">{error}</div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={state === "submitting"}
          className="h-11 w-full rounded-lg bg-aula-accent text-[13.5px] font-medium text-white transition-colors hover:bg-aula-accent-hover focus:outline-none focus:ring-2 focus:ring-aula-accent focus:ring-offset-2 disabled:opacity-50"
        >
          {state === "submitting" ? "Joining..." : "Join the waitlist"}
        </button>
      </div>
    </form>
  );
}

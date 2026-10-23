import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Aula PT",
  description: "Privacy policy for Aula PT, explaining how we handle your information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16 md:px-8 md:py-20">
        <div className="mb-10">
          <Link
            href="/welcome"
            className="inline-flex items-center gap-2 text-[13px] text-aula-text-2 transition-colors hover:text-aula-text"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>
        </div>

        <h1 className="mb-3 text-[32px] font-semibold tracking-[-0.02em] text-aula-text">Privacy Policy</h1>
        <p className="mb-10 text-[13px] text-aula-text-3">Last updated: October 21, 2026</p>

        <div className="space-y-8 text-[14px] leading-relaxed text-aula-text-2">
          <section>
            <h2 className="mb-3 text-[18px] font-semibold text-aula-text">What we collect</h2>
            <p className="mb-3">When you create an account on Aula PT, we collect:</p>
            <ul className="ml-6 list-disc space-y-1.5">
              <li>Your email address (for authentication)</li>
              <li>Your name (if you sign in with Google)</li>
              <li>Your learning progress and activity data</li>
              <li>Your language level and study preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-[18px] font-semibold text-aula-text">How we use your information</h2>
            <p className="mb-3">We use your information to:</p>
            <ul className="ml-6 list-disc space-y-1.5">
              <li>Provide access to your account and learning materials</li>
              <li>Track your progress through lessons and exercises</li>
              <li>Save your vocabulary mastery and review schedule</li>
              <li>Personalize your learning experience based on your level</li>
            </ul>
            <p className="mt-3">
              We will never sell, rent, or share your personal information with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[18px] font-semibold text-aula-text">Data storage</h2>
            <p>
              Your account and learning data are stored securely in our database hosted by Supabase (a secure,
              privacy-focused backend provider). All data is encrypted in transit and at rest.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[18px] font-semibold text-aula-text">Analytics</h2>
            <p>
              Aula PT uses Vercel Analytics and Speed Insights to understand how visitors use our site. These tools
              collect anonymized usage data (page views, performance metrics) but do not track personal information or
              use cookies for advertising.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[18px] font-semibold text-aula-text">Your rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="ml-6 list-disc space-y-1.5">
              <li>Access a copy of the information we hold about you</li>
              <li>Request that we delete your account and associated data</li>
              <li>Update or correct your personal information</li>
              <li>Export your learning data at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-[18px] font-semibold text-aula-text">Account deletion</h2>
            <p>
              You can request account deletion from your account settings page. This will permanently remove your
              account, progress data, and personal information from our systems.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[18px] font-semibold text-aula-text">Changes to this policy</h2>
            <p>
              We may update this privacy policy from time to time. When we do, we will revise the "Last updated" date
              at the top of this page. Continued use of Aula PT after changes constitutes acceptance of the updated
              policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[18px] font-semibold text-aula-text">Questions</h2>
            <p>
              If you have questions about this privacy policy or how we handle your data, you can manage your
              preferences and data through your{" "}
              <Link href="/settings" className="text-aula-accent hover:underline">
                account settings
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

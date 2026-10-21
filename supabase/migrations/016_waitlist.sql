-- Migration: Waitlist table for landing page email collection
-- Created: 2026-10-21
-- Purpose: Store waitlist signups with email validation and consent tracking

-- Enable citext extension for case-insensitive email storage
CREATE EXTENSION IF NOT EXISTS citext;

-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT NOT NULL UNIQUE,
  level TEXT CHECK (level IN ('beginner', 'some-basics', 'intermediate') OR level IS NULL),
  consent_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL DEFAULT 'welcome-page',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Anonymous users can insert (for waitlist signup)
CREATE POLICY "Anonymous users can insert into waitlist"
  ON public.waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: No select for anonymous users (privacy)
-- (No policy means no access, so we don't need an explicit DENY)

-- Policy: Authenticated service role can select (for admin/export)
CREATE POLICY "Service role can select from waitlist"
  ON public.waitlist
  FOR SELECT
  TO service_role
  USING (true);

-- Create index on email for faster duplicate checks
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist (email);

-- Create index on created_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist (created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE public.waitlist IS 'Waitlist signups from the landing page with consent tracking';
COMMENT ON COLUMN public.waitlist.email IS 'Case-insensitive email address (citext)';
COMMENT ON COLUMN public.waitlist.level IS 'Self-reported Portuguese level: beginner, some-basics, or intermediate';
COMMENT ON COLUMN public.waitlist.consent_at IS 'Timestamp when user gave consent to receive updates';
COMMENT ON COLUMN public.waitlist.source IS 'Source of the signup (e.g., welcome-page)';

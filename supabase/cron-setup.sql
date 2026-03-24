-- ═══════════════════════════════════════════════════════════════
-- Aafiya — Supabase Cron Jobs (pg_cron + pg_net)
--
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- These use pg_net to make HTTP calls to our API routes.
--
-- Prerequisites: pg_cron and pg_net extensions must be enabled.
-- Supabase enables both by default on all projects.
-- ═══════════════════════════════════════════════════════════════

-- Enable extensions (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ── 1. Process pending reminders — every 5 minutes ──────────

SELECT cron.unschedule('aafiya-process-reminders')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'aafiya-process-reminders'
);

SELECT cron.schedule(
  'aafiya-process-reminders',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.app_url', true) || '/api/cron/reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret', true)
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ── 2. Generate follow-up tasks — every 2 hours ─────────────

SELECT cron.unschedule('aafiya-generate-followups')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'aafiya-generate-followups'
);

SELECT cron.schedule(
  'aafiya-generate-followups',
  '0 */2 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.app_url', true) || '/api/cron/followups',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret', true)
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ── 3. Daily task seeding — every day at 00:05 UTC ──────────
-- Seeds today's check-in reminders for all users.
-- This calls a dedicated endpoint that loops through active users.

SELECT cron.unschedule('aafiya-seed-daily-tasks')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'aafiya-seed-daily-tasks'
);

SELECT cron.schedule(
  'aafiya-seed-daily-tasks',
  '5 0 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.app_url', true) || '/api/cron/seed-daily',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret', true)
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ── 4. Cleanup expired/old tasks — daily at 03:00 UTC ───────

SELECT cron.unschedule('aafiya-cleanup-tasks')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'aafiya-cleanup-tasks'
);

SELECT cron.schedule(
  'aafiya-cleanup-tasks',
  '0 3 * * *',
  $$
  -- Expire old pending tasks (older than 24 hours)
  UPDATE "ScheduledTask"
  SET status = 'expired', "updatedAt" = NOW()
  WHERE status = 'pending'
    AND "scheduledFor" < NOW() - INTERVAL '24 hours';

  -- Delete completed/expired/dismissed tasks older than 30 days
  DELETE FROM "ScheduledTask"
  WHERE status IN ('sent', 'expired', 'dismissed', 'failed')
    AND "completedAt" < NOW() - INTERVAL '30 days';

  -- Delete old notification logs (older than 90 days)
  DELETE FROM "NotificationLog"
  WHERE "sentAt" < NOW() - INTERVAL '90 days';
  $$
);

-- ═══════════════════════════════════════════════════════════════
-- CONFIGURATION
-- ═══════════════════════════════════════════════════════════════
-- Set these in Supabase Dashboard → Settings → Database → Settings
-- Or run:
--
--   ALTER DATABASE postgres SET app.settings.app_url = 'https://your-app.vercel.app';
--   ALTER DATABASE postgres SET app.settings.cron_secret = 'your-cron-secret-here';
--
-- For local dev:
--   ALTER DATABASE postgres SET app.settings.app_url = 'http://localhost:3000';
--   ALTER DATABASE postgres SET app.settings.cron_secret = 'aafiya_cron_secret_change_in_production';
-- ═══════════════════════════════════════════════════════════════

-- ── Verify cron jobs are registered ──────────────────────────
SELECT jobname, schedule, command FROM cron.job WHERE jobname LIKE 'aafiya-%';

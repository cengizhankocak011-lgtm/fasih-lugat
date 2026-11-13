/*
# Server-side request quota

1. New Tables
- `request_quota`
  - `quota_key` (text, primary key) - the caller bucket, e.g. "generate-word:<ip>:<window>"
  - `hits` (integer, not null, default 0) - requests counted in the window
  - `expires_at` (timestamptz, not null) - when the bucket may be discarded

2. Security
- Row level security is enabled and no policies exist, so browsers can never read or write this table.
- Only server functions, through the service role, use it.

3. New function
- `consume_rate_limit(p_key, p_limit, p_window_seconds)` atomically counts one request and returns
  false once the limit for the window is reached. SECURITY DEFINER, fixed search_path,
  EXECUTE revoked from PUBLIC/anon/authenticated and granted only to service_role.
*/

CREATE TABLE IF NOT EXISTS request_quota (
  quota_key text PRIMARY KEY,
  hits integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL
);

ALTER TABLE request_quota ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON request_quota FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON request_quota TO service_role;

CREATE INDEX IF NOT EXISTS request_quota_expires_at_idx ON request_quota (expires_at);

CREATE OR REPLACE FUNCTION consume_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_window_start timestamptz;
  v_bucket text;
  v_hits integer;
BEGIN
  IF p_key IS NULL OR btrim(p_key) = '' OR p_limit IS NULL OR p_limit < 1 THEN
    RETURN false;
  END IF;

  v_window_start := to_timestamp(floor(extract(epoch FROM now()) / greatest(p_window_seconds, 1)) * greatest(p_window_seconds, 1));
  v_bucket := left(p_key, 200) || ':' || extract(epoch FROM v_window_start)::bigint::text;

  INSERT INTO request_quota AS q (quota_key, hits, expires_at)
  VALUES (v_bucket, 1, v_window_start + make_interval(secs => greatest(p_window_seconds, 1)))
  ON CONFLICT (quota_key) DO UPDATE SET hits = q.hits + 1
  RETURNING hits INTO v_hits;

  DELETE FROM request_quota WHERE expires_at < now() - interval '1 hour';

  RETURN v_hits <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION consume_rate_limit(text, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION consume_rate_limit(text, integer, integer) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION consume_rate_limit(text, integer, integer) TO service_role;

/*
# Cache for AI-generated dictionary card details

1. New Tables
- `word_details`
  - `entry_id` (text, primary key) - the dictionary entry id the details belong to
  - `details` (jsonb, not null) - synonyms and Quran example sentences
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `word_details`.
- No policies and no grants for `anon` or `authenticated`: browsers can never read or write this table directly.
- Only server-side code using the service role reads and writes it, through the word-details function.

3. Notes
- Rows are written once per word and reused on every later card open, so each word is generated only once.
*/

CREATE TABLE IF NOT EXISTS word_details (
  entry_id text PRIMARY KEY,
  details jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE word_details ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON word_details TO service_role;

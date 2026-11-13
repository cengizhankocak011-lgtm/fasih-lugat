/*
# Saved AI-generated dictionary words

1. New Tables
- `generated_words`
  - `query_key` (text, primary key) - the normalized search text that produced the card
  - `entry` (jsonb, not null) - the full dictionary card (word, root, meanings, examples)
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `generated_words`.
- Anyone (anon and authenticated) can read rows, because generated cards are shared dictionary content.
- No insert, update or delete grants or policies for browsers: only the server-side generate-word function, using the service role, writes rows.

3. Notes
- Each search text is generated once; later searches for the same text reuse the saved card.
*/

CREATE TABLE IF NOT EXISTS generated_words (
  query_key text PRIMARY KEY,
  entry jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE generated_words ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON generated_words TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON generated_words TO service_role;

DROP POLICY IF EXISTS "anyone_can_read_generated_words" ON generated_words;
CREATE POLICY "anyone_can_read_generated_words" ON generated_words FOR SELECT
TO anon, authenticated USING (true);

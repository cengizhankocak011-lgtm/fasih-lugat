/*
# Create feedback_messages table

1. New Tables
- `feedback_messages`
  - `id` (uuid, primary key, generated automatically)
  - `kind` (text, either 'destek' for support requests or 'oneri' for suggestions)
  - `message` (text, 10 to 2000 characters)
  - `contact` (text, optional, up to 120 characters, so the team can reply)
  - `created_at` (timestamptz, set automatically)

2. Security
- Row level security is enabled on `feedback_messages`.
- The public app (anon key) may only INSERT messages. It cannot read, edit, or delete anything, so visitors cannot see each other's messages.
- Messages are read by the team directly in the database dashboard.

3. Notes
- Length and type checks are enforced in the database as well as in the app.
*/

CREATE TABLE IF NOT EXISTS feedback_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('destek', 'oneri')),
  message text NOT NULL CHECK (char_length(btrim(message)) BETWEEN 10 AND 2000),
  contact text CHECK (contact IS NULL OR char_length(contact) <= 120),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE feedback_messages ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON feedback_messages TO anon, authenticated;

DROP POLICY IF EXISTS "anon_insert_feedback_messages" ON feedback_messages;
CREATE POLICY "anon_insert_feedback_messages" ON feedback_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

/*
# Restrict feedback writes to the server

1. Changed Tables
- `feedback_messages`: the public app can no longer insert rows directly.

2. Security
- Removed the INSERT policy that allowed anonymous inserts.
- Revoked INSERT from the `anon` and `authenticated` roles.
- Feedback is now submitted through a server function, which validates the message, saves it, and emails the team. That function uses the server's own credentials, so visitors still cannot read or write the table directly.

3. Notes
- Existing messages are untouched.
*/

DROP POLICY IF EXISTS "anon_insert_feedback_messages" ON feedback_messages;
REVOKE INSERT ON feedback_messages FROM anon, authenticated;

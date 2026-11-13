/*
# Remove browser privileges on the feedback messages table

1. Security
- Revokes every privilege the `anon` and `authenticated` roles still held on `feedback_messages`
  (SELECT, UPDATE, DELETE came from the project's default privileges, never from a migration).
- Row level security already denied these statements; the grants are now gone as well, so the
  table matches its intended design: only the server function, using the service role, touches it.

2. Notes
- Existing messages are untouched. The feedback form keeps working because it submits through
  the send-feedback server function, not through the browser's database connection.
*/

REVOKE ALL ON feedback_messages FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON feedback_messages TO service_role;

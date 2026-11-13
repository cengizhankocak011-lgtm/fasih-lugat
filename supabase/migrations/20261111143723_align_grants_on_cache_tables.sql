/*
# Match browser privileges on the saved-content tables to their intent

1. Security
- `generated_words`: browsers keep SELECT (generated cards are shared dictionary content read by
  the app) and lose the INSERT, UPDATE and DELETE privileges that came from default privileges.
- `word_details`: browsers lose every privilege. This cache is only ever read and written by the
  word-details server function through the service role.
- Row level security already denied these statements; the grants now match the design too.

2. Notes
- No data is changed. The dictionary keeps reading generated_words exactly as before.
*/

REVOKE ALL ON generated_words FROM anon, authenticated;
GRANT SELECT ON generated_words TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON generated_words TO service_role;

REVOKE ALL ON word_details FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON word_details TO service_role;

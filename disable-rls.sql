-- Disable Row Level Security on all tables
-- Run this if you already created your tables and are getting RLS errors

ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE balance_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE stipend_config DISABLE ROW LEVEL SECURITY;

-- Optional: If you want to drop RLS completely (but disable is usually enough)
-- ALTER TABLE categories NO FORCE ROW LEVEL SECURITY;
-- ALTER TABLE expenses NO FORCE ROW LEVEL SECURITY;
-- ALTER TABLE balance_entries NO FORCE ROW LEVEL SECURITY;
-- ALTER TABLE stipend_config NO FORCE ROW LEVEL SECURITY;

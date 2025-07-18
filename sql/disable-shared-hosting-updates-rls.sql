-- Disable RLS for shared_hosting_updates table
-- This is a quick fix for the RLS policy violation error
-- Run this in your Supabase SQL Editor

-- =====================================================
-- DISABLE RLS
-- =====================================================

ALTER TABLE shared_hosting_updates DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check if RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'shared_hosting_updates';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS has been disabled for shared_hosting_updates table!';
  RAISE NOTICE '🔓 The table now allows all operations without RLS restrictions';
  RAISE NOTICE '🚀 Try creating a shared hosting update again';
  RAISE NOTICE '⚠️  Note: This removes RLS protection - ensure your API has proper authentication';
END $$; 
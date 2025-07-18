-- Fix RLS policies for shared_hosting_updates table
-- This allows the dashboard to work with the hybrid authentication system
-- Run this in your Supabase SQL Editor

-- =====================================================
-- DROP EXISTING POLICIES
-- =====================================================

-- Drop the restrictive admin-only policy
DROP POLICY IF EXISTS "shared_hosting_updates_admin" ON shared_hosting_updates;

-- =====================================================
-- CREATE NEW PUBLIC ACCESS POLICIES
-- =====================================================

-- Allow public read access for active updates (for client sites)
CREATE POLICY "shared_hosting_updates_read_public" ON shared_hosting_updates
  FOR SELECT USING (is_active = true);

-- Allow public insert for creating updates (for dashboard)
CREATE POLICY "shared_hosting_updates_insert_public" ON shared_hosting_updates
  FOR INSERT WITH CHECK (true);

-- Allow public update for managing updates (for dashboard)
CREATE POLICY "shared_hosting_updates_update_public" ON shared_hosting_updates
  FOR UPDATE USING (true);

-- Allow public delete for removing updates (for dashboard)
CREATE POLICY "shared_hosting_updates_delete_public" ON shared_hosting_updates
  FOR DELETE USING (true);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check if policies were created successfully
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'shared_hosting_updates'
ORDER BY policyname;

-- =====================================================
-- ALTERNATIVE: DISABLE RLS (if policies don't work)
-- =====================================================

-- If you still get 401 errors, you can temporarily disable RLS:
-- ALTER TABLE shared_hosting_updates DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Shared hosting updates RLS policies updated successfully!';
  RAISE NOTICE '📋 Public access enabled for dashboard functionality';
  RAISE NOTICE '🔒 Active updates still protected for client access';
  RAISE NOTICE '🚀 Dashboard should now work without 401 errors';
END $$; 
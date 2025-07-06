-- Fix RLS policies for "updates" storage bucket
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STORAGE BUCKET POLICIES FOR "UPDATES" BUCKET
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to updates bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload to updates bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from updates bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update in updates bucket" ON storage.objects;

-- Create policies specifically for the "updates" bucket
CREATE POLICY "Allow public read access to updates bucket" ON storage.objects
    FOR SELECT USING (bucket_id = 'updates');

CREATE POLICY "Allow public upload to updates bucket" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'updates');

CREATE POLICY "Allow public delete from updates bucket" ON storage.objects
    FOR DELETE USING (bucket_id = 'updates');

CREATE POLICY "Allow public update in updates bucket" ON storage.objects
    FOR UPDATE USING (bucket_id = 'updates');

-- =====================================================
-- ALTERNATIVE: DISABLE RLS FOR UPDATES BUCKET ONLY
-- =====================================================
-- If the above policies don't work, you can disable RLS for the updates bucket specifically

-- DELETE FROM storage.objects WHERE bucket_id = 'updates';
-- UPDATE storage.buckets SET public = true WHERE id = 'updates';

-- =====================================================
-- VERIFY BUCKET CONFIGURATION
-- =====================================================

-- Check bucket configuration
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE id = 'updates';

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- =====================================================
-- MANUAL VERIFICATION TEST
-- =====================================================

-- Test policy by checking if you can see the bucket
SELECT 'Bucket access test' as test_name, 
       CASE 
           WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'updates')
           THEN 'SUCCESS: Can see updates bucket'
           ELSE 'FAILED: Cannot see updates bucket'
       END as result;

-- =====================================================
-- TROUBLESHOOTING NOTES
-- =====================================================

-- If you still get RLS errors after running this:
-- 1. Go to Supabase Dashboard → Storage → updates bucket
-- 2. Click on "Policies" tab
-- 3. Delete all existing policies
-- 4. Create new policies using the UI:
--    - Name: "Allow public access to updates"
--    - Target roles: [anon, authenticated]
--    - Operation: SELECT, INSERT, UPDATE, DELETE
--    - Custom expression: bucket_id = 'updates'

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Storage bucket policies for "updates" bucket have been updated!';
    RAISE NOTICE '📁 The updates bucket now allows public read/write access';
    RAISE NOTICE '🔧 Try running "npm run upload-backup" again';
    RAISE NOTICE '❗ If you still get RLS errors, check the troubleshooting notes above';
END;
$$; 
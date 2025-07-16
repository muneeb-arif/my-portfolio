-- Fix Storage Bucket Policies for Images Upload
-- Run this in your Supabase SQL Editor

-- =====================================================
-- FIX IMAGES BUCKET POLICIES
-- =====================================================

-- Drop existing policies for images bucket
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own files" ON storage.objects;

-- Create new, more permissive policies for images bucket
CREATE POLICY "Allow public read access to images" ON storage.objects 
  FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Allow authenticated users to upload images" ON storage.objects 
  FOR INSERT WITH CHECK (
    bucket_id = 'images' 
    AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
  );

CREATE POLICY "Allow authenticated users to update images" ON storage.objects 
  FOR UPDATE USING (
    bucket_id = 'images' 
    AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
  );

CREATE POLICY "Allow authenticated users to delete images" ON storage.objects 
  FOR DELETE USING (
    bucket_id = 'images' 
    AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
  );

-- =====================================================
-- ALTERNATIVE: DISABLE RLS FOR IMAGES BUCKET (if above doesn't work)
-- =====================================================

-- If you still get RLS errors, you can temporarily disable RLS for the images bucket:
-- UPDATE storage.buckets SET public = true WHERE id = 'images';

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
WHERE id = 'images';

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
AND schemaname = 'storage'
AND qual LIKE '%images%';

-- =====================================================
-- MANUAL VERIFICATION TEST
-- =====================================================

-- Test policy by checking if you can see the bucket
SELECT 'Images bucket access test' as test_name, 
       CASE 
           WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'images')
           THEN 'SUCCESS: Can see images bucket'
           ELSE 'FAILED: Cannot see images bucket'
       END as result;

-- =====================================================
-- TROUBLESHOOTING NOTES
-- =====================================================

-- If you still get RLS errors after running this:
-- 1. Go to Supabase Dashboard → Storage → images bucket
-- 2. Click on "Policies" tab
-- 3. Delete all existing policies
-- 4. Create new policies using the UI:
--    - Name: "Allow authenticated access to images"
--    - Target roles: [authenticated, service_role]
--    - Operation: SELECT, INSERT, UPDATE, DELETE
--    - Custom expression: bucket_id = 'images'

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Storage bucket policies for "images" bucket have been updated!';
    RAISE NOTICE '📁 The images bucket now allows authenticated users to upload';
    RAISE NOTICE '🔧 Try uploading images again in the dashboard';
    RAISE NOTICE '❗ If you still get RLS errors, check the troubleshooting notes above';
END;
$$; 
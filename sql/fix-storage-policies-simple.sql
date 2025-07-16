-- Simple Fix: Disable RLS for Images Bucket
-- Run this in your Supabase SQL Editor

-- =====================================================
-- QUICK FIX: DISABLE RLS FOR IMAGES BUCKET
-- =====================================================

-- Disable RLS for the images bucket
UPDATE storage.buckets 
SET public = true 
WHERE id = 'images';

-- Drop all existing policies for the images bucket
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete images" ON storage.objects;

-- Create simple, permissive policies
CREATE POLICY "Allow all operations on images" ON storage.objects 
  FOR ALL USING (bucket_id = 'images');

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check if the bucket is now public
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'images';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Images bucket RLS has been disabled!';
    RAISE NOTICE '📁 The images bucket is now public and allows all operations';
    RAISE NOTICE '🔧 Try uploading images again in the dashboard';
    RAISE NOTICE '⚠️ Note: This makes the images bucket public - ensure this is acceptable for your use case';
END;
$$; 
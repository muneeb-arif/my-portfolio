-- Setup updates bucket for build uploads and theme updates
-- 
-- ⚠️  IMPORTANT: If you get "must be owner of table objects" error,
-- follow the MANUAL SETUP below instead of running this SQL.

-- ======================
-- MANUAL SETUP (RECOMMENDED)
-- ======================

-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "Create bucket"
-- 3. Use these settings:
--    • Name: updates
--    • Public: ✅ YES (checked)    
--    • File size limit: 50MB
--    • Allowed MIME types: application/zip, application/x-zip-compressed
-- 4. Click "Create bucket"

-- That's it! The script will work with just the bucket creation.

-- ======================
-- OPTIONAL: RLS POLICIES (Advanced)
-- ======================

-- Only run these if you have admin/owner permissions:
-- These policies may fail with "must be owner" error, which is fine.
-- The bucket will still work for uploads.

-- Enable RLS (may fail - that's okay)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Create policies (may fail - that's okay)
-- CREATE POLICY "updates_bucket_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'updates');
-- CREATE POLICY "updates_bucket_select" ON storage.objects FOR SELECT USING (bucket_id = 'updates');
-- CREATE POLICY "updates_bucket_update" ON storage.objects FOR UPDATE USING (bucket_id = 'updates');
-- CREATE POLICY "updates_bucket_delete" ON storage.objects FOR DELETE USING (bucket_id = 'updates');

-- ======================
-- VERIFICATION
-- ======================

-- Check if bucket was created successfully:
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'updates';

-- Expected result:
-- id: updates
-- public: true
-- file_size_limit: 52428800 (50MB)
-- allowed_mime_types: {application/zip,application/x-zip-compressed}

-- ======================
-- BUCKET CONFIGURATION POLICIES
-- ======================

-- Allow reading bucket configurations
CREATE POLICY "Allow reading updates bucket config" ON storage.buckets
  FOR SELECT 
  USING (id = 'updates');

-- Allow creating buckets (if needed)
CREATE POLICY "Allow creating updates bucket" ON storage.buckets
  FOR INSERT 
  WITH CHECK (id = 'updates');

-- ======================
-- MANUAL BUCKET CREATION (Alternative)
-- ======================

-- If the above policies don't work, create bucket manually:
-- Go to Supabase Storage UI and create this bucket:

-- UPDATES BUCKET:
-- - Name: updates  
-- - Public: true
-- - File size limit: 50MB
-- - Allowed MIME types: application/zip, application/x-zip-compressed

-- ======================
-- TROUBLESHOOTING
-- ======================

-- If you still get RLS errors, you may need to temporarily disable RLS:
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;
-- But this is not recommended for production.

-- To check existing policies:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
-- SELECT * FROM pg_policies WHERE tablename = 'buckets' AND schemaname = 'storage';

-- To check if bucket exists:
-- SELECT * FROM storage.buckets WHERE id = 'updates'; 
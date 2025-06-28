-- =====================================================
-- 🔧 FIX RLS POLICIES FOR SYNC OPERATIONS
-- =====================================================
-- Run this in your Supabase SQL Editor to fix the sync issues

-- =====================================================
-- 1. FIX CATEGORIES RLS POLICIES
-- =====================================================

-- Drop existing policies for categories
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON categories;

-- Create new policies that allow full access for authenticated users
CREATE POLICY "Allow authenticated users full access to categories" ON categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Alternative: If you want more specific policies
-- CREATE POLICY "Allow authenticated users to read categories" ON categories FOR SELECT USING (true);
-- CREATE POLICY "Allow authenticated users to insert categories" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Allow authenticated users to update categories" ON categories FOR UPDATE USING (auth.role() = 'authenticated');
-- CREATE POLICY "Allow authenticated users to delete categories" ON categories FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- 2. FIX NICHE RLS POLICIES
-- =====================================================

-- Drop existing policies for niche
DROP POLICY IF EXISTS "Allow public read access to niche" ON niche;
DROP POLICY IF EXISTS "Allow authenticated users to manage niche" ON niche;

-- Create new policies that allow full access for authenticated users
CREATE POLICY "Allow authenticated users full access to niche" ON niche
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 3. VERIFY POLICIES ARE WORKING
-- =====================================================

-- Test categories access
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
WHERE tablename IN ('categories', 'niche')
ORDER BY tablename, policyname;

-- =====================================================
-- 4. ALTERNATIVE: TEMPORARILY DISABLE RLS (FOR TESTING)
-- =====================================================
-- Uncomment these lines if you want to temporarily disable RLS for testing

-- ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE niche DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. RE-ENABLE RLS (AFTER TESTING)
-- =====================================================
-- Uncomment these lines after testing to re-enable RLS

-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE niche ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE HELPER FUNCTION FOR CLEARING DATA
-- =====================================================

-- Create a function to clear categories (if needed)
CREATE OR REPLACE FUNCTION clear_categories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM categories;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION clear_categories() TO authenticated;

-- =====================================================
-- 7. TEST THE FIXES
-- =====================================================

-- Test inserting a category
INSERT INTO categories (name, description, color) 
VALUES ('Test Category', 'Test Description', '#ff0000')
ON CONFLICT (name) DO NOTHING;

-- Test deleting a category
DELETE FROM categories WHERE name = 'Test Category';

-- Check if it worked
SELECT * FROM categories WHERE name = 'Test Category';

-- =====================================================
-- INSTRUCTIONS:
-- =====================================================
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run" to execute
-- 5. Test the sync functionality in your app
-- ===================================================== 
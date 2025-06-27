-- Fix RLS policies to allow public access to portfolio owner's data
-- This enables Scenario 3: Public access to specific user's data via .env configuration
-- Run this in your Supabase SQL Editor

-- =====================================================
-- HELPER FUNCTION: Get Portfolio Owner User ID
-- =====================================================

CREATE OR REPLACE FUNCTION get_portfolio_owner_user_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    owner_user_id UUID;
BEGIN
    -- Get the user_id of the active portfolio owner
    SELECT user_id INTO owner_user_id
    FROM portfolio_config 
    WHERE is_active = true 
    LIMIT 1;
    
    RETURN owner_user_id;
END;
$$;

-- =====================================================
-- HELPER FUNCTION: Check if User ID is Portfolio Owner
-- =====================================================

CREATE OR REPLACE FUNCTION is_portfolio_owner_user_id(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    owner_user_id UUID;
BEGIN
    -- Get the active portfolio owner's user_id
    SELECT user_id INTO owner_user_id
    FROM portfolio_config 
    WHERE is_active = true 
    LIMIT 1;
    
    -- Return true if the provided user_id matches the portfolio owner
    RETURN (check_user_id = owner_user_id);
END;
$$;

-- =====================================================
-- UPDATE PROJECTS RLS POLICIES
-- =====================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Public can view published projects" ON projects;

-- Create new policy that allows:
-- 1. Public access to published projects of portfolio owner
-- 2. Authenticated users can view their own projects
CREATE POLICY "Public can view portfolio owner published projects" ON projects 
  FOR SELECT USING (
    -- Allow if project is published AND belongs to portfolio owner
    (status = 'published' AND is_portfolio_owner_user_id(user_id))
    OR
    -- Allow authenticated users to see their own projects
    (auth.role() = 'authenticated' AND auth.uid() = user_id)
  );

-- =====================================================
-- UPDATE CATEGORIES RLS POLICIES
-- =====================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Public can view portfolio owner categories" ON categories;

-- Create new policy
CREATE POLICY "Public can view portfolio owner categories" ON categories 
  FOR SELECT USING (
    -- Allow public access to portfolio owner's categories
    is_portfolio_owner_user_id(user_id)
    OR
    -- Allow authenticated users to see their own categories
    (auth.role() = 'authenticated' AND auth.uid() = user_id)
  );

-- =====================================================
-- UPDATE NICHE RLS POLICIES
-- =====================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Public can view portfolio owner niche" ON niche;

-- Create new policy
CREATE POLICY "Public can view portfolio owner niche" ON niche 
  FOR SELECT USING (
    -- Allow public access to portfolio owner's niches
    is_portfolio_owner_user_id(user_id)
    OR
    -- Allow authenticated users to see their own niches
    (auth.role() = 'authenticated' AND auth.uid() = user_id)
  );

-- =====================================================
-- UPDATE DOMAINS_TECHNOLOGIES RLS POLICIES
-- =====================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Public can view portfolio owner domains_technologies" ON domains_technologies;

-- Create new policy
CREATE POLICY "Public can view portfolio owner domains_technologies" ON domains_technologies 
  FOR SELECT USING (
    -- Allow public access to portfolio owner's domains/technologies
    is_portfolio_owner_user_id(user_id)
    OR
    -- Allow authenticated users to see their own domains/technologies
    (auth.role() = 'authenticated' AND auth.uid() = user_id)
  );

-- =====================================================
-- UPDATE TECH_SKILLS RLS POLICIES
-- =====================================================

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Public can view portfolio owner tech_skills" ON tech_skills;

-- Create new policy
CREATE POLICY "Public can view portfolio owner tech_skills" ON tech_skills 
  FOR SELECT USING (
    -- Allow public access to tech skills of portfolio owner's domains/technologies
    EXISTS (
      SELECT 1 FROM domains_technologies dt 
      WHERE dt.id = domain_technology_id 
      AND is_portfolio_owner_user_id(dt.user_id)
    )
    OR
    -- Allow authenticated users to see their own tech skills
    EXISTS (
      SELECT 1 FROM domains_technologies dt 
      WHERE dt.id = domain_technology_id 
      AND auth.role() = 'authenticated' 
      AND auth.uid() = dt.user_id
    )
  );

-- =====================================================
-- UPDATE SETTINGS RLS POLICIES
-- =====================================================

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Public can view portfolio owner settings" ON settings;

-- Create new policy
CREATE POLICY "Public can view portfolio owner settings" ON settings 
  FOR SELECT USING (
    -- Allow public access to portfolio owner's settings
    is_portfolio_owner_user_id(user_id)
    OR
    -- Allow authenticated users to see their own settings
    (auth.role() = 'authenticated' AND auth.uid() = user_id)
  );

-- =====================================================
-- UPDATE PROJECT_IMAGES RLS POLICIES
-- =====================================================

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Public can view portfolio owner project images" ON project_images;

-- Create new policy
CREATE POLICY "Public can view portfolio owner project images" ON project_images 
  FOR SELECT USING (
    -- Allow public access to images of published projects by portfolio owner
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_id 
      AND p.status = 'published'
      AND is_portfolio_owner_user_id(p.user_id)
    )
    OR
    -- Allow authenticated users to see their own project images
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_id 
      AND auth.role() = 'authenticated' 
      AND auth.uid() = p.user_id
    )
  );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Test the helper functions
SELECT 
  'Portfolio Owner User ID' as test,
  get_portfolio_owner_user_id() as result;

-- Verify policies are created
SELECT 
  schemaname,
  tablename, 
  policyname,
  cmd,
  CASE WHEN qual IS NOT NULL THEN 'HAS_CONDITION' ELSE 'NO_CONDITION' END as has_condition
FROM pg_policies 
WHERE tablename IN ('projects', 'categories', 'niche', 'domains_technologies', 'tech_skills', 'settings', 'project_images')
AND policyname LIKE '%portfolio owner%'
ORDER BY tablename, policyname;

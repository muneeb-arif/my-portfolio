-- Fix RLS policies to allow public access to portfolio owner's data
-- This enables Scenario 3: Public access to specific user's data via .env configuration
-- Version 2 CORRECTED: Fixed tech_skills column name (tech_id instead of domain_technology_id)
-- Run this in your Supabase SQL Editor

-- =====================================================
-- UPDATE PROJECTS RLS POLICIES
-- =====================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Public can view published projects" ON projects;
DROP POLICY IF EXISTS "Public can view portfolio owner published projects" ON projects;

-- Create new policy that allows:
-- 1. Public access to published projects of portfolio owner
-- 2. Authenticated users can view their own projects  
CREATE POLICY "Public can view portfolio owner published projects" ON projects 
  FOR SELECT USING (
    -- Allow if project is published AND belongs to portfolio owner
    (status = 'published' AND is_portfolio_owner(user_id))
    OR
    -- Allow authenticated users to see their own projects
    (auth.role() = 'authenticated' AND auth.uid() = user_id)
  );

-- =====================================================
-- UPDATE CATEGORIES RLS POLICIES
-- =====================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Public can view categories" ON categories;
DROP POLICY IF EXISTS "Public can view portfolio owner categories" ON categories;

-- Create new policy
CREATE POLICY "Public can view portfolio owner categories" ON categories 
  FOR SELECT USING (
    -- Allow public access to portfolio owner's categories
    is_portfolio_owner(user_id)
    OR
    -- Allow authenticated users to see their own categories
    (auth.role() = 'authenticated' AND auth.uid() = user_id)
  );

-- =====================================================
-- UPDATE NICHE RLS POLICIES
-- =====================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Public can view niche" ON niche;
DROP POLICY IF EXISTS "Public can view portfolio owner niche" ON niche;

-- Create new policy
CREATE POLICY "Public can view portfolio owner niche" ON niche 
  FOR SELECT USING (
    -- Allow public access to portfolio owner's niches
    is_portfolio_owner(user_id)
    OR
    -- Allow authenticated users to see their own niches
    (auth.role() = 'authenticated' AND auth.uid() = user_id)
  );

-- =====================================================
-- UPDATE DOMAINS_TECHNOLOGIES RLS POLICIES  
-- =====================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Public can view domains_technologies" ON domains_technologies;
DROP POLICY IF EXISTS "Public can view portfolio owner domains_technologies" ON domains_technologies;

-- Create new policy
CREATE POLICY "Public can view portfolio owner domains_technologies" ON domains_technologies 
  FOR SELECT USING (
    -- Allow public access to portfolio owner's domains/technologies
    is_portfolio_owner(user_id)
    OR
    -- Allow authenticated users to see their own domains/technologies
    (auth.role() = 'authenticated' AND auth.uid() = user_id)
  );

-- =====================================================
-- UPDATE TECH_SKILLS RLS POLICIES
-- =====================================================

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Public can view tech_skills" ON tech_skills;
DROP POLICY IF EXISTS "Public can view portfolio owner tech_skills" ON tech_skills;

-- Create new policy
CREATE POLICY "Public can view portfolio owner tech_skills" ON tech_skills 
  FOR SELECT USING (
    -- Allow public access to tech skills of portfolio owner's domains/technologies
    EXISTS (
      SELECT 1 FROM domains_technologies dt 
      WHERE dt.id = tech_id 
      AND is_portfolio_owner(dt.user_id)
    )
    OR
    -- Allow authenticated users to see their own tech skills
    EXISTS (
      SELECT 1 FROM domains_technologies dt 
      WHERE dt.id = tech_id 
      AND auth.role() = 'authenticated' 
      AND auth.uid() = dt.user_id
    )
  );

-- =====================================================
-- UPDATE SETTINGS RLS POLICIES
-- =====================================================

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Public can view settings" ON settings;
DROP POLICY IF EXISTS "Public can view portfolio owner settings" ON settings;

-- Create new policy
CREATE POLICY "Public can view portfolio owner settings" ON settings 
  FOR SELECT USING (
    -- Allow public access to portfolio owner's settings
    is_portfolio_owner(user_id)
    OR
    -- Allow authenticated users to see their own settings
    (auth.role() = 'authenticated' AND auth.uid() = user_id)
  );

-- =====================================================
-- UPDATE PROJECT_IMAGES RLS POLICIES
-- =====================================================

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Public can view project_images" ON project_images;
DROP POLICY IF EXISTS "Public can view portfolio owner project images" ON project_images;

-- Create new policy
CREATE POLICY "Public can view portfolio owner project images" ON project_images 
  FOR SELECT USING (
    -- Allow public access to images of published projects by portfolio owner
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_id 
      AND p.status = 'published'
      AND is_portfolio_owner(p.user_id)
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

-- Check if portfolio_config exists and is properly configured
SELECT 
  'Portfolio Config Status' as test,
  COUNT(*) as total_configs,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_configs,
  STRING_AGG(owner_email, ', ') as configured_emails
FROM portfolio_config;

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

-- Test query to see what data would be visible to public users
-- (This should return data if portfolio is properly configured)
SELECT 
  'Public Data Test' as test,
  COUNT(*) as visible_published_projects
FROM projects 
WHERE status = 'published' AND is_portfolio_owner(user_id);

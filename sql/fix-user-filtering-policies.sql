-- Fix RLS policies to filter categories, niche, and domains_technologies by portfolio owner
-- Run this in your Supabase SQL Editor

-- =====================================================
-- UPDATE CATEGORIES FILTERING
-- =====================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Public can view categories" ON categories;

-- Create new policy that filters by portfolio owner
CREATE POLICY "Public can view portfolio owner categories" ON categories 
  FOR SELECT USING (is_portfolio_owner(user_id));

-- =====================================================
-- UPDATE NICHE FILTERING  
-- =====================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Public can view niche" ON niche;

-- Create new policy that filters by portfolio owner
CREATE POLICY "Public can view portfolio owner niche" ON niche 
  FOR SELECT USING (is_portfolio_owner(user_id));

-- =====================================================
-- UPDATE DOMAINS_TECHNOLOGIES FILTERING
-- =====================================================

-- Drop and recreate domains_technologies policy (in case it's not working)
DROP POLICY IF EXISTS "Public can view domains_technologies" ON domains_technologies;

-- Create new policy that filters by portfolio owner
CREATE POLICY "Public can view portfolio owner domains_technologies" ON domains_technologies 
  FOR SELECT USING (is_portfolio_owner(user_id));

-- =====================================================
-- UPDATE TECH_SKILLS FILTERING
-- =====================================================

-- Drop and recreate tech_skills policy (in case it's not working)
DROP POLICY IF EXISTS "Public can view tech_skills" ON tech_skills;

-- Create new policy that filters by portfolio owner
CREATE POLICY "Public can view portfolio owner tech_skills" ON tech_skills 
  FOR SELECT USING (is_portfolio_owner(user_id));

-- =====================================================
-- VERIFY POLICIES
-- =====================================================

-- Check that all policies are created correctly
SELECT 
  tablename, 
  policyname, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename IN ('categories', 'niche', 'domains_technologies', 'tech_skills')
ORDER BY tablename, policyname;

-- =====================================================
-- TEST THE PORTFOLIO OWNER FUNCTION
-- =====================================================

-- Test if the is_portfolio_owner function is working
-- This should return the portfolio owner's user ID
SELECT get_portfolio_owner_id() as portfolio_owner_id;

-- This should show the active portfolio configuration
SELECT * FROM portfolio_config WHERE is_active = true; 
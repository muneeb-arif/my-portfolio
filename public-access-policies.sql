-- SQL script to enable public read access for portfolio data
-- Run this in your Supabase SQL Editor

-- =====================================================
-- CREATE PORTFOLIO OWNER CONFIGURATION TABLE
-- =====================================================

-- Table to store portfolio owner configuration
CREATE TABLE IF NOT EXISTS portfolio_config (
    id SERIAL PRIMARY KEY,
    owner_email TEXT UNIQUE NOT NULL,
    owner_user_id UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on portfolio_config
ALTER TABLE portfolio_config ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active portfolio config
CREATE POLICY "Public can view active portfolio config" ON portfolio_config 
  FOR SELECT USING (is_active = true);

-- Allow authenticated users to manage portfolio config
CREATE POLICY "Authenticated users can manage portfolio config" ON portfolio_config 
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get user ID by email (for portfolio owner resolution)
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id uuid;
BEGIN
    -- Get user ID from auth.users table
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = user_email;
    
    RETURN user_id;
END;
$$;

-- Function to get the active portfolio owner's user ID
CREATE OR REPLACE FUNCTION get_portfolio_owner_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    owner_id uuid;
BEGIN
    -- Get the active portfolio owner's user ID
    SELECT owner_user_id INTO owner_id
    FROM portfolio_config
    WHERE is_active = true
    LIMIT 1;
    
    RETURN owner_id;
END;
$$;

-- Function to check if a user_id belongs to the portfolio owner
CREATE OR REPLACE FUNCTION is_portfolio_owner(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    owner_id uuid;
BEGIN
    -- Get the active portfolio owner's user ID
    SELECT get_portfolio_owner_id() INTO owner_id;
    
    -- Return true if the user is the portfolio owner or if no owner is configured
    RETURN (owner_id IS NULL OR check_user_id = owner_id);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_id_by_email(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_portfolio_owner_id() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_portfolio_owner(uuid) TO authenticated, anon;

-- =====================================================
-- UPDATE RLS POLICIES FOR FILTERED PUBLIC ACCESS
-- =====================================================

-- 1. Projects: Allow public read access to published projects from portfolio owner
DROP POLICY IF EXISTS "Public can view published projects" ON projects;
CREATE POLICY "Public can view published projects" ON projects 
  FOR SELECT USING (
    status = 'published' 
    AND is_portfolio_owner(user_id)
  );

-- 2. Project Images: Allow public read access to images of published projects from portfolio owner
DROP POLICY IF EXISTS "Public can view published project images" ON project_images;
CREATE POLICY "Public can view published project images" ON project_images 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_images.project_id 
      AND projects.status = 'published'
      AND is_portfolio_owner(projects.user_id)
    )
  );

-- 3. Categories: Allow public read access (categories are global)
DROP POLICY IF EXISTS "Public can view categories" ON categories;
CREATE POLICY "Public can view categories" ON categories 
  FOR SELECT USING (true);

-- 4. Domains/Technologies: Allow public read access only from portfolio owner
DROP POLICY IF EXISTS "Public can view domains_technologies" ON domains_technologies;
CREATE POLICY "Public can view domains_technologies" ON domains_technologies 
  FOR SELECT USING (is_portfolio_owner(user_id));

-- 5. Tech Skills: Allow public read access only from portfolio owner
DROP POLICY IF EXISTS "Public can view tech_skills" ON tech_skills;
CREATE POLICY "Public can view tech_skills" ON tech_skills 
  FOR SELECT USING (is_portfolio_owner(user_id));

-- 6. Niche: Allow public read access (niches are global)
DROP POLICY IF EXISTS "Public can view niche" ON niche;
CREATE POLICY "Public can view niche" ON niche 
  FOR SELECT USING (true);

-- 7. Settings: Allow public read access to specific settings from portfolio owner
DROP POLICY IF EXISTS "Public can view public settings" ON settings;
CREATE POLICY "Public can view public settings" ON settings 
  FOR SELECT USING (
    is_portfolio_owner(user_id)
    AND key IN (
      'siteName', 'tagline', 'bannerName', 'bannerTitle', 
      'logoImage', 'heroImage', 'avatarImage', 'resumeUrl',
      'githubUrl', 'linkedinUrl', 'twitterUrl', 'emailAddress',
      'footerCopyright'
    )
  );

-- =====================================================
-- SETUP INSTRUCTIONS
-- =====================================================

-- To configure your portfolio owner, run this command with your email:
-- INSERT INTO portfolio_config (owner_email, owner_user_id) 
-- VALUES ('your-email@example.com', get_user_id_by_email('your-email@example.com'))
-- ON CONFLICT (owner_email) 
-- DO UPDATE SET 
--   owner_user_id = get_user_id_by_email('your-email@example.com'),
--   is_active = true,
--   updated_at = NOW();

-- =====================================================
-- VERIFY POLICIES
-- =====================================================

-- Check that policies are created correctly
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename IN ('projects', 'project_images', 'categories', 'domains_technologies', 'tech_skills', 'niche', 'settings', 'portfolio_config')
ORDER BY tablename, policyname; 
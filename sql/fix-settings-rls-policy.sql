-- Fix Settings RLS Policy to Include theme_name and Correct Key Names
-- Run this in your Supabase SQL Editor

-- =====================================================
-- UPDATE SETTINGS RLS POLICY
-- =====================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Public can view public settings" ON settings;
DROP POLICY IF EXISTS "Public can view settings" ON settings;
DROP POLICY IF EXISTS "Public can view portfolio owner settings" ON settings;

-- Create updated policy with correct key names and theme_name included
CREATE POLICY "Public can view portfolio owner settings" ON settings 
  FOR SELECT USING (
    is_portfolio_owner(user_id)
    AND key IN (
      -- Theme settings
      'theme_name',
      
      -- Logo settings  
      'logo_type',
      'logo_initials', 
      'logo_image',
      
      -- Banner/Hero settings
      'hero_banner_image',
      'avatar_image',
      'banner_name',
      'banner_title', 
      'banner_tagline',
      
      -- Resume and files
      'resume_file',
      
      -- Social media settings
      'social_email',
      'social_github',
      'social_instagram', 
      'social_facebook',
      
      -- Footer settings
      'copyright_text',
      
      -- Legacy key names (for backward compatibility)
      'siteName', 
      'tagline', 
      'bannerName', 
      'bannerTitle', 
      'logoImage', 
      'heroImage', 
      'avatarImage', 
      'resumeUrl',
      'githubUrl', 
      'linkedinUrl', 
      'twitterUrl', 
      'emailAddress',
      'footerCopyright'
    )
  );

-- =====================================================
-- VERIFY THE POLICY UPDATE
-- =====================================================

-- Check that the policy was created correctly
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'settings'
ORDER BY policyname;

-- Test query: This should now work for theme_name
-- SELECT * FROM settings WHERE key = 'theme_name' AND is_portfolio_owner(user_id); 
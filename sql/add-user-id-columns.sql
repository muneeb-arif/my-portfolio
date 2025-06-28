-- Add user_id columns to tables for user filtering
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: ADD USER_ID COLUMNS TO TABLES
-- =====================================================

-- Add user_id to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to niche table  
ALTER TABLE niche 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Check if domains_technologies already has user_id (it should based on the original policies)
-- If not, add it
ALTER TABLE domains_technologies 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to tech_skills table
ALTER TABLE tech_skills 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- =====================================================
-- STEP 2: GET THE PORTFOLIO OWNER'S USER ID
-- =====================================================

-- First, let's see what user ID we're working with
SELECT 
    pc.owner_email,
    pc.owner_user_id,
    au.email as auth_email
FROM portfolio_config pc
LEFT JOIN auth.users au ON pc.owner_user_id = au.id
WHERE pc.is_active = true;

-- =====================================================
-- STEP 3: UPDATE EXISTING RECORDS WITH USER_ID
-- =====================================================

-- Get the portfolio owner's user ID for updates
DO $$
DECLARE
    portfolio_owner_id UUID;
BEGIN
    -- Get the portfolio owner's user ID
    SELECT owner_user_id INTO portfolio_owner_id
    FROM portfolio_config 
    WHERE is_active = true 
    LIMIT 1;
    
    -- If we found a portfolio owner, update existing records
    IF portfolio_owner_id IS NOT NULL THEN
        -- Update categories that don't have user_id set
        UPDATE categories 
        SET user_id = portfolio_owner_id 
        WHERE user_id IS NULL;
        
        -- Update niche that don't have user_id set
        UPDATE niche 
        SET user_id = portfolio_owner_id 
        WHERE user_id IS NULL;
        
        -- Update domains_technologies that don't have user_id set
        UPDATE domains_technologies 
        SET user_id = portfolio_owner_id 
        WHERE user_id IS NULL;
        
        -- Update tech_skills that don't have user_id set
        UPDATE tech_skills 
        SET user_id = portfolio_owner_id 
        WHERE user_id IS NULL;
        
        RAISE NOTICE 'Updated existing records with user_id: %', portfolio_owner_id;
    ELSE
        RAISE NOTICE 'No active portfolio owner found - records not updated';
    END IF;
END $$;

-- =====================================================
-- STEP 4: VERIFY THE UPDATES
-- =====================================================

-- Check that records now have user_id values
SELECT 'categories' as table_name, COUNT(*) as total_records, COUNT(user_id) as records_with_user_id
FROM categories
UNION ALL
SELECT 'niche' as table_name, COUNT(*) as total_records, COUNT(user_id) as records_with_user_id  
FROM niche
UNION ALL
SELECT 'domains_technologies' as table_name, COUNT(*) as total_records, COUNT(user_id) as records_with_user_id
FROM domains_technologies
UNION ALL
SELECT 'tech_skills' as table_name, COUNT(*) as total_records, COUNT(user_id) as records_with_user_id
FROM tech_skills; 
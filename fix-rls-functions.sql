-- Fix RLS Helper Functions for Multiple Active Portfolio Owners
-- This ensures the correct user data is accessible via RLS policies

-- =====================================================
-- ENHANCED HELPER FUNCTIONS
-- =====================================================

-- Updated function to get portfolio owner by email (if specified)
CREATE OR REPLACE FUNCTION get_portfolio_owner_id_by_email(target_email text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    owner_id uuid;
BEGIN
    -- If a specific email is provided, get that user's ID
    IF target_email IS NOT NULL THEN
        SELECT owner_user_id INTO owner_id
        FROM portfolio_config
        WHERE owner_email = target_email 
        AND is_active = true
        LIMIT 1;
        
        IF owner_id IS NOT NULL THEN
            RETURN owner_id;
        END IF;
    END IF;
    
    -- Fallback: get any active portfolio owner (most recently updated first)
    SELECT owner_user_id INTO owner_id
    FROM portfolio_config
    WHERE is_active = true
    ORDER BY updated_at DESC
    LIMIT 1;
    
    RETURN owner_id;
END;
$$;

-- Updated main function to prioritize most recently updated active config
CREATE OR REPLACE FUNCTION get_portfolio_owner_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    owner_id uuid;
BEGIN
    -- Get the most recently updated active portfolio owner
    SELECT owner_user_id INTO owner_id
    FROM portfolio_config
    WHERE is_active = true
    ORDER BY updated_at DESC
    LIMIT 1;
    
    RETURN owner_id;
END;
$$;

-- Enhanced is_portfolio_owner function that checks against all active owners
CREATE OR REPLACE FUNCTION is_portfolio_owner(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the user_id matches ANY active portfolio owner
    RETURN EXISTS (
        SELECT 1 
        FROM portfolio_config 
        WHERE owner_user_id = check_user_id 
        AND is_active = true
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_portfolio_owner_id_by_email(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_portfolio_owner_id() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_portfolio_owner(uuid) TO authenticated, anon;

-- =====================================================
-- UPDATE fareedrao7890@gmail.com TO BE MOST RECENT
-- =====================================================

-- Update fareedrao7890@gmail.com to have the most recent timestamp
-- This ensures get_portfolio_owner_id() returns the correct user
UPDATE portfolio_config 
SET updated_at = NOW() 
WHERE owner_email = 'fareedrao7890@gmail.com';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Test the functions
SELECT 
    'Function Test Results' as test_section,
    get_portfolio_owner_id() as current_portfolio_owner_id,
    get_portfolio_owner_id_by_email('fareedrao7890@gmail.com') as fareed_user_id,
    is_portfolio_owner('033f0150-6671-41e5-a968-ff40e9f07f26') as is_fareed_portfolio_owner;

-- Show current configuration order
SELECT 
    'Portfolio Config Order' as info,
    owner_email,
    owner_user_id,
    is_active,
    updated_at,
    CASE 
        WHEN owner_email = 'fareedrao7890@gmail.com' THEN '← TARGET USER'
        ELSE ''
    END as note
FROM portfolio_config 
WHERE is_active = true
ORDER BY updated_at DESC; 
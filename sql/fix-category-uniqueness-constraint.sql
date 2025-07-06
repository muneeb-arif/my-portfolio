-- Fix category uniqueness constraint - make categories unique per user, not globally
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: CHECK CURRENT TABLE STRUCTURE
-- =====================================================

-- Check if user_id column exists
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;

-- Check existing constraints
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'categories'
    AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY');

-- =====================================================
-- STEP 2: ADD USER_ID COLUMN IF MISSING
-- =====================================================

-- Add user_id column if it doesn't exist
DO $$
BEGIN
    -- Check if user_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'user_id'
    ) THEN
        -- Add user_id column
        ALTER TABLE categories 
        ADD COLUMN user_id UUID REFERENCES auth.users(id);
        
        RAISE NOTICE '✅ Added user_id column to categories table';
    ELSE
        RAISE NOTICE 'ℹ️ user_id column already exists in categories table';
    END IF;
END $$;

-- =====================================================
-- STEP 3: DROP EXISTING UNIQUE CONSTRAINT ON NAME
-- =====================================================

-- Find and drop the unique constraint on name field
DO $$
DECLARE
    constraint_name_var TEXT;
BEGIN
    -- Find the unique constraint on the name column
    SELECT tc.constraint_name INTO constraint_name_var
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'categories'
        AND tc.constraint_type = 'UNIQUE'
        AND kcu.column_name = 'name';
    
    -- Drop the constraint if found
    IF constraint_name_var IS NOT NULL THEN
        EXECUTE format('ALTER TABLE categories DROP CONSTRAINT %I', constraint_name_var);
        RAISE NOTICE '✅ Dropped unique constraint: %', constraint_name_var;
    ELSE
        RAISE NOTICE 'ℹ️ No unique constraint on name column found';
    END IF;
END $$;

-- =====================================================
-- STEP 4: CREATE COMPOSITE UNIQUE CONSTRAINT
-- =====================================================

-- Create unique constraint on (name, user_id) combination
DO $$
BEGIN
    -- Create the composite unique constraint
    ALTER TABLE categories 
    ADD CONSTRAINT categories_name_user_id_unique 
    UNIQUE (name, user_id);
    
    RAISE NOTICE '✅ Created composite unique constraint: categories_name_user_id_unique';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️ Composite unique constraint already exists';
    WHEN others THEN
        RAISE NOTICE '❌ Error creating composite constraint: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 5: ASSIGN EXISTING CATEGORIES TO PORTFOLIO OWNER
-- =====================================================

-- Update existing categories that don't have user_id set
DO $$
DECLARE
    portfolio_owner_id UUID;
    updated_count INTEGER;
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
        
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        
        RAISE NOTICE '✅ Updated % existing categories with user_id: %', updated_count, portfolio_owner_id;
    ELSE
        RAISE NOTICE '⚠️ No active portfolio owner found - existing categories not updated';
        RAISE NOTICE '💡 You may need to manually assign user_id to existing categories';
    END IF;
END $$;

-- =====================================================
-- STEP 6: VERIFICATION AND TESTING
-- =====================================================

-- Show current table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;

-- Show all constraints
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'categories'
GROUP BY tc.constraint_name, tc.constraint_type
ORDER BY tc.constraint_type, tc.constraint_name;

-- Show sample data
SELECT 
    id, 
    name, 
    user_id, 
    description, 
    created_at 
FROM categories 
ORDER BY created_at DESC 
LIMIT 5;

-- =====================================================
-- STEP 7: TEST THE FIX
-- =====================================================

-- Test that different users can now create categories with the same name
-- (This is just a demonstration - you would run this with different user sessions)

/*
-- User A creates a category called "Web Development"
INSERT INTO categories (name, description, color, user_id) 
VALUES ('Test Category', 'User A Test', '#3b82f6', 'user-a-uuid-here');

-- User B can also create a category called "Web Development" 
INSERT INTO categories (name, description, color, user_id) 
VALUES ('Test Category', 'User B Test', '#8b5cf6', 'user-b-uuid-here');

-- But User A cannot create another "Web Development" category (should fail)
INSERT INTO categories (name, description, color, user_id) 
VALUES ('Test Category', 'User A Duplicate', '#ef4444', 'user-a-uuid-here');
*/

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Category uniqueness constraint fix completed!';
    RAISE NOTICE '✅ Categories are now unique per user (name, user_id)';
    RAISE NOTICE '✅ Different users can have categories with the same name';
    RAISE NOTICE '✅ Same user cannot have duplicate category names';
    RAISE NOTICE '💡 Test the fix by creating categories as different users';
END $$; 
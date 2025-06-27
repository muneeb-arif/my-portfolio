-- Fix RLS policy for portfolio_config to allow initial setup
-- Run this in your Supabase SQL Editor

-- First, drop all existing policies to clean up
DROP POLICY IF EXISTS "Public can view active portfolio config" ON portfolio_config;
DROP POLICY IF EXISTS "Authenticated users can manage portfolio config" ON portfolio_config;
DROP POLICY IF EXISTS "Portfolio config management" ON portfolio_config;

-- Create simple, non-recursive policies

-- 1. Allow public read access to active portfolio configs
CREATE POLICY "Allow public read of active config" ON portfolio_config 
  FOR SELECT USING (is_active = true);

-- 2. Allow anonymous users to insert/update portfolio config (for initial setup)
CREATE POLICY "Allow anonymous portfolio setup" ON portfolio_config 
  FOR INSERT WITH CHECK (auth.role() = 'anon' OR auth.role() = 'authenticated');

CREATE POLICY "Allow anonymous portfolio update" ON portfolio_config 
  FOR UPDATE USING (auth.role() = 'anon' OR auth.role() = 'authenticated');

-- 3. Allow authenticated users full access
CREATE POLICY "Allow authenticated full access" ON portfolio_config 
  FOR ALL USING (auth.role() = 'authenticated');

-- Check that policies are created
SELECT tablename, policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'portfolio_config'; 
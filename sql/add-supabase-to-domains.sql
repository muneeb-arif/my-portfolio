-- =====================================================
-- ADD SUPABASE CONFIGURATION TO DOMAINS TABLE
-- =====================================================
-- This allows each domain to use its own Supabase project
-- If not set, domains will use the default Supabase from env vars

-- Add Supabase configuration columns to domains table
ALTER TABLE domains 
ADD COLUMN IF NOT EXISTS supabase_url VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS supabase_anon_key VARCHAR(500) NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_domains_supabase ON domains(supabase_url);

-- Add comment
ALTER TABLE domains 
MODIFY COLUMN supabase_url VARCHAR(500) NULL COMMENT 'Custom Supabase URL for this domain (optional)',
MODIFY COLUMN supabase_anon_key VARCHAR(500) NULL COMMENT 'Custom Supabase anon key for this domain (optional)';

-- =====================================================
-- USAGE EXAMPLE:
-- =====================================================
-- To set custom Supabase for a specific domain:
-- UPDATE domains 
-- SET supabase_url = 'https://your-project.supabase.co',
--     supabase_anon_key = 'your-anon-key-here'
-- WHERE name LIKE '%nsfw.theexpertways.com%';
--
-- To use default Supabase (from env vars), leave these columns NULL


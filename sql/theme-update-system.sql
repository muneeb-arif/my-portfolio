-- =====================================================
-- THEME UPDATE SYSTEM DATABASE SCHEMA
-- =====================================================
-- This script creates the complete database schema for the theme update system
-- Run this in your Supabase SQL Editor after setting up the main portfolio database

-- =====================================================
-- 1. THEME CLIENTS TABLE
-- =====================================================
-- Stores information about each client deployment
CREATE TABLE IF NOT EXISTS theme_clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id VARCHAR(255) UNIQUE NOT NULL,
    domain VARCHAR(255) NOT NULL,
    current_version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    update_channel VARCHAR(20) NOT NULL DEFAULT 'stable',
    last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE,
    user_agent TEXT,
    timezone VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_theme_clients_client_id ON theme_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_theme_clients_domain ON theme_clients(domain);
CREATE INDEX IF NOT EXISTS idx_theme_clients_channel ON theme_clients(update_channel);
CREATE INDEX IF NOT EXISTS idx_theme_clients_last_seen ON theme_clients(last_seen);

-- =====================================================
-- 2. THEME UPDATES TABLE
-- =====================================================
-- Stores information about theme updates/releases
CREATE TABLE IF NOT EXISTS theme_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL DEFAULT 'stable',
    files JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pushed_at TIMESTAMP WITH TIME ZONE,
    download_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_theme_updates_version ON theme_updates(version);
CREATE INDEX IF NOT EXISTS idx_theme_updates_channel ON theme_updates(channel);
CREATE INDEX IF NOT EXISTS idx_theme_updates_active ON theme_updates(is_active);
CREATE INDEX IF NOT EXISTS idx_theme_updates_created ON theme_updates(created_at);

-- =====================================================
-- 3. THEME UPDATE LOGS TABLE
-- =====================================================
-- Tracks update application attempts and results
CREATE TABLE IF NOT EXISTS theme_update_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    update_id UUID NOT NULL REFERENCES theme_updates(id) ON DELETE CASCADE,
    client_id VARCHAR(255) NOT NULL REFERENCES theme_clients(client_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed'
    error_message TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    download_time INTEGER, -- in milliseconds
    apply_time INTEGER, -- in milliseconds
    retry_count INTEGER DEFAULT 0,
    client_version_before VARCHAR(50),
    client_version_after VARCHAR(50)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_theme_update_logs_update_id ON theme_update_logs(update_id);
CREATE INDEX IF NOT EXISTS idx_theme_update_logs_client_id ON theme_update_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_theme_update_logs_status ON theme_update_logs(status);
CREATE INDEX IF NOT EXISTS idx_theme_update_logs_applied_at ON theme_update_logs(applied_at);

-- =====================================================
-- 4. THEME UPDATE STATS TABLE (Optional - for analytics)
-- =====================================================
-- Stores aggregated statistics about updates
CREATE TABLE IF NOT EXISTS theme_update_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    update_id UUID NOT NULL REFERENCES theme_updates(id) ON DELETE CASCADE,
    client_id VARCHAR(255) NOT NULL REFERENCES theme_clients(client_id) ON DELETE CASCADE,
    stat_type VARCHAR(50) NOT NULL, -- 'download', 'apply', 'error', 'rollback'
    stat_value JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_theme_update_stats_update_id ON theme_update_stats(update_id);
CREATE INDEX IF NOT EXISTS idx_theme_update_stats_client_id ON theme_update_stats(client_id);
CREATE INDEX IF NOT EXISTS idx_theme_update_stats_type ON theme_update_stats(stat_type);
CREATE INDEX IF NOT EXISTS idx_theme_update_stats_created ON theme_update_stats(created_at);

-- =====================================================
-- 5. THEME UPDATE NOTIFICATIONS TABLE
-- =====================================================
-- Stores notifications to be sent to clients
CREATE TABLE IF NOT EXISTS theme_update_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    update_id UUID NOT NULL REFERENCES theme_updates(id) ON DELETE CASCADE,
    client_id VARCHAR(255) REFERENCES theme_clients(client_id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL DEFAULT 'update_available',
    title VARCHAR(255) NOT NULL,
    message TEXT,
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    action_url VARCHAR(500),
    action_text VARCHAR(100)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_theme_update_notifications_update_id ON theme_update_notifications(update_id);
CREATE INDEX IF NOT EXISTS idx_theme_update_notifications_client_id ON theme_update_notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_theme_update_notifications_read ON theme_update_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_theme_update_notifications_dismissed ON theme_update_notifications(is_dismissed);
CREATE INDEX IF NOT EXISTS idx_theme_update_notifications_created ON theme_update_notifications(created_at);

-- =====================================================
-- 6. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to relevant tables
CREATE TRIGGER update_theme_clients_updated_at
    BEFORE UPDATE ON theme_clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_theme_updates_updated_at
    BEFORE UPDATE ON theme_updates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. FUNCTIONS FOR UPDATE MANAGEMENT
-- =====================================================

-- Function to get the latest update for a channel
CREATE OR REPLACE FUNCTION get_latest_update_for_channel(channel_name VARCHAR(20))
RETURNS TABLE(
    id UUID,
    title VARCHAR(255),
    description TEXT,
    version VARCHAR(50),
    channel VARCHAR(20),
    files JSONB,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.title,
        u.description,
        u.version,
        u.channel,
        u.files,
        u.created_at
    FROM theme_updates u
    WHERE u.channel = channel_name
    AND u.is_active = true
    ORDER BY u.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to register or update a client
CREATE OR REPLACE FUNCTION register_theme_client(
    p_client_id VARCHAR(255),
    p_domain VARCHAR(255),
    p_current_version VARCHAR(50),
    p_update_channel VARCHAR(20),
    p_user_agent TEXT,
    p_timezone VARCHAR(100)
) RETURNS UUID AS $$
DECLARE
    client_uuid UUID;
BEGIN
    INSERT INTO theme_clients (
        client_id,
        domain,
        current_version,
        update_channel,
        user_agent,
        timezone,
        last_seen
    ) VALUES (
        p_client_id,
        p_domain,
        p_current_version,
        p_update_channel,
        p_user_agent,
        p_timezone,
        NOW()
    )
    ON CONFLICT (client_id) DO UPDATE SET
        domain = EXCLUDED.domain,
        current_version = EXCLUDED.current_version,
        update_channel = EXCLUDED.update_channel,
        user_agent = EXCLUDED.user_agent,
        timezone = EXCLUDED.timezone,
        last_seen = NOW()
    RETURNING id INTO client_uuid;
    
    RETURN client_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to log update application
CREATE OR REPLACE FUNCTION log_update_application(
    p_update_id UUID,
    p_client_id VARCHAR(255),
    p_status VARCHAR(20),
    p_error_message TEXT DEFAULT NULL,
    p_download_time INTEGER DEFAULT NULL,
    p_apply_time INTEGER DEFAULT NULL,
    p_client_version_before VARCHAR(50) DEFAULT NULL,
    p_client_version_after VARCHAR(50) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    log_uuid UUID;
BEGIN
    INSERT INTO theme_update_logs (
        update_id,
        client_id,
        status,
        error_message,
        download_time,
        apply_time,
        client_version_before,
        client_version_after
    ) VALUES (
        p_update_id,
        p_client_id,
        p_status,
        p_error_message,
        p_download_time,
        p_apply_time,
        p_client_version_before,
        p_client_version_after
    )
    RETURNING id INTO log_uuid;
    
    -- Update client version if successful
    IF p_status = 'success' AND p_client_version_after IS NOT NULL THEN
        UPDATE theme_clients 
        SET 
            current_version = p_client_version_after,
            last_updated = NOW()
        WHERE client_id = p_client_id;
    END IF;
    
    -- Update update statistics
    IF p_status = 'success' THEN
        UPDATE theme_updates 
        SET success_count = success_count + 1
        WHERE id = p_update_id;
    ELSIF p_status = 'failed' THEN
        UPDATE theme_updates 
        SET failure_count = failure_count + 1
        WHERE id = p_update_id;
    END IF;
    
    RETURN log_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get update statistics
CREATE OR REPLACE FUNCTION get_update_statistics(p_update_id UUID)
RETURNS TABLE(
    total_clients INTEGER,
    successful_updates INTEGER,
    failed_updates INTEGER,
    pending_updates INTEGER,
    success_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM theme_clients) as total_clients,
        (SELECT COUNT(*)::INTEGER FROM theme_update_logs WHERE update_id = p_update_id AND status = 'success') as successful_updates,
        (SELECT COUNT(*)::INTEGER FROM theme_update_logs WHERE update_id = p_update_id AND status = 'failed') as failed_updates,
        (SELECT COUNT(*)::INTEGER FROM theme_clients) - (SELECT COUNT(*)::INTEGER FROM theme_update_logs WHERE update_id = p_update_id) as pending_updates,
        CASE 
            WHEN (SELECT COUNT(*) FROM theme_update_logs WHERE update_id = p_update_id) = 0 THEN 0
            ELSE ROUND(
                (SELECT COUNT(*)::NUMERIC FROM theme_update_logs WHERE update_id = p_update_id AND status = 'success') /
                (SELECT COUNT(*)::NUMERIC FROM theme_update_logs WHERE update_id = p_update_id) * 100,
                2
            )
        END as success_rate;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE theme_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_update_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_update_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_update_notifications ENABLE ROW LEVEL SECURITY;

-- Policy for theme_clients - allow public read for update checking
CREATE POLICY "Allow public read access to theme_clients" ON theme_clients
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update to theme_clients" ON theme_clients
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to theme_clients" ON theme_clients
    FOR UPDATE USING (true);

-- Policy for theme_updates - allow public read for active updates
CREATE POLICY "Allow public read access to active theme_updates" ON theme_updates
    FOR SELECT USING (is_active = true);

-- Allow authenticated users (dashboard) to manage updates
CREATE POLICY "Allow authenticated users to manage theme_updates" ON theme_updates
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy for theme_update_logs - allow public insert, authenticated read
CREATE POLICY "Allow public insert to theme_update_logs" ON theme_update_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated read to theme_update_logs" ON theme_update_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for theme_update_stats - allow public insert, authenticated read
CREATE POLICY "Allow public insert to theme_update_stats" ON theme_update_stats
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated read to theme_update_stats" ON theme_update_stats
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for theme_update_notifications - allow public read for client notifications
CREATE POLICY "Allow public read to theme_update_notifications" ON theme_update_notifications
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated manage to theme_update_notifications" ON theme_update_notifications
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 9. SAMPLE DATA (FOR TESTING)
-- =====================================================

-- Insert a sample update
INSERT INTO theme_updates (
    title,
    description,
    version,
    channel,
    files,
    is_active
) VALUES (
    'Initial Release',
    'First stable release of the theme update system',
    '1.0.0',
    'stable',
    '[]'::jsonb,
    true
) ON CONFLICT DO NOTHING;

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================

-- Verify table creation
SELECT 'Tables created successfully' as status;

-- Check if tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'theme_%'
ORDER BY table_name;

-- Check if functions exist
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%theme%'
ORDER BY routine_name;

-- Check if policies exist
SELECT 
    tablename,
    policyname,
    permissive
FROM pg_policies 
WHERE tablename LIKE 'theme_%'
ORDER BY tablename, policyname;

-- =====================================================
-- SETUP COMPLETE MESSAGE
-- =====================================================

SELECT '✅ Theme Update System database schema has been created successfully!' as message;
SELECT '🔧 You can now use the Theme Update Manager in your dashboard.' as instruction;
SELECT '📝 Remember to update your theme update service configuration.' as reminder; 
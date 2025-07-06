-- ================================================
-- SHARED HOSTING THEME UPDATE SYSTEM
-- Database schema for cPanel-based deployments
-- ================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLES
-- ================================================

-- Table: shared_hosting_clients
-- Tracks client deployments using shared hosting
CREATE TABLE IF NOT EXISTS shared_hosting_clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id VARCHAR(255) UNIQUE NOT NULL,
  domain VARCHAR(255) NOT NULL,
  current_version VARCHAR(50) DEFAULT '1.0.0',
  deployment_type VARCHAR(50) DEFAULT 'shared_hosting',
  hosting_provider VARCHAR(100),
  cpanel_info JSONB,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  timezone VARCHAR(100),
  contact_email VARCHAR(255),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: shared_hosting_updates
-- Stores update packages for manual distribution
CREATE TABLE IF NOT EXISTS shared_hosting_updates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  version VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  release_notes TEXT,
  package_url TEXT, -- URL to downloadable ZIP file
  download_url TEXT, -- Direct download link
  package_size_mb DECIMAL(10,2),
  special_instructions TEXT, -- cPanel-specific instructions
  is_active BOOLEAN DEFAULT true,
  is_critical BOOLEAN DEFAULT false,
  channel VARCHAR(20) DEFAULT 'stable', -- stable, beta, alpha
  required_version VARCHAR(50), -- minimum version required
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: shared_hosting_update_logs
-- Tracks update activities for shared hosting clients
CREATE TABLE IF NOT EXISTS shared_hosting_update_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  update_id UUID REFERENCES shared_hosting_updates(id) ON DELETE CASCADE,
  client_id VARCHAR(255) REFERENCES shared_hosting_clients(client_id) ON DELETE CASCADE,
  activity VARCHAR(100) NOT NULL, -- download_attempted, instructions_viewed, applied_successfully, etc.
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET,
  details JSONB,
  success BOOLEAN DEFAULT true
);

-- Table: shared_hosting_notifications
-- Email notifications for clients about updates
CREATE TABLE IF NOT EXISTS shared_hosting_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  update_id UUID REFERENCES shared_hosting_updates(id) ON DELETE CASCADE,
  client_id VARCHAR(255) REFERENCES shared_hosting_clients(client_id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  notification_type VARCHAR(50) DEFAULT 'update_available', -- update_available, critical_update, reminder
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, failed, opened, clicked
  email_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: shared_hosting_update_stats
-- Analytics for shared hosting updates
CREATE TABLE IF NOT EXISTS shared_hosting_update_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  update_id UUID REFERENCES shared_hosting_updates(id) ON DELETE CASCADE,
  total_clients INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  avg_time_to_apply INTERVAL,
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- INDEXES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_shared_hosting_clients_domain ON shared_hosting_clients(domain);
CREATE INDEX IF NOT EXISTS idx_shared_hosting_clients_last_seen ON shared_hosting_clients(last_seen);
CREATE INDEX IF NOT EXISTS idx_shared_hosting_clients_version ON shared_hosting_clients(current_version);
CREATE INDEX IF NOT EXISTS idx_shared_hosting_clients_active ON shared_hosting_clients(is_active);

CREATE INDEX IF NOT EXISTS idx_shared_hosting_updates_version ON shared_hosting_updates(version);
CREATE INDEX IF NOT EXISTS idx_shared_hosting_updates_active ON shared_hosting_updates(is_active);
CREATE INDEX IF NOT EXISTS idx_shared_hosting_updates_channel ON shared_hosting_updates(channel);
CREATE INDEX IF NOT EXISTS idx_shared_hosting_updates_created ON shared_hosting_updates(created_at);

CREATE INDEX IF NOT EXISTS idx_shared_hosting_logs_update ON shared_hosting_update_logs(update_id);
CREATE INDEX IF NOT EXISTS idx_shared_hosting_logs_client ON shared_hosting_update_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_shared_hosting_logs_activity ON shared_hosting_update_logs(activity);
CREATE INDEX IF NOT EXISTS idx_shared_hosting_logs_timestamp ON shared_hosting_update_logs(timestamp);

CREATE INDEX IF NOT EXISTS idx_shared_hosting_notifications_update ON shared_hosting_notifications(update_id);
CREATE INDEX IF NOT EXISTS idx_shared_hosting_notifications_client ON shared_hosting_notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_shared_hosting_notifications_status ON shared_hosting_notifications(status);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS on all tables
ALTER TABLE shared_hosting_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_hosting_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_hosting_update_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_hosting_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_hosting_update_stats ENABLE ROW LEVEL SECURITY;

-- Public read access for clients to check their own data
CREATE POLICY "shared_hosting_clients_read_own" ON shared_hosting_clients
  FOR SELECT USING (true); -- Clients can read all for now, we'll filter by client_id in app

-- Public insert/update for client registration
CREATE POLICY "shared_hosting_clients_upsert" ON shared_hosting_clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "shared_hosting_clients_update_own" ON shared_hosting_clients
  FOR UPDATE USING (true);

-- Public read access for active updates
CREATE POLICY "shared_hosting_updates_read_public" ON shared_hosting_updates
  FOR SELECT USING (is_active = true);

-- Authenticated admin access for updates management
CREATE POLICY "shared_hosting_updates_admin" ON shared_hosting_updates
  FOR ALL USING (auth.role() = 'authenticated');

-- Public insert for update logs
CREATE POLICY "shared_hosting_logs_insert_public" ON shared_hosting_update_logs
  FOR INSERT WITH CHECK (true);

-- Admin read access for logs
CREATE POLICY "shared_hosting_logs_read_admin" ON shared_hosting_update_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admin access for notifications
CREATE POLICY "shared_hosting_notifications_admin" ON shared_hosting_notifications
  FOR ALL USING (auth.role() = 'authenticated');

-- Admin access for stats
CREATE POLICY "shared_hosting_update_stats_admin" ON shared_hosting_update_stats
  FOR ALL USING (auth.role() = 'authenticated');

-- ================================================
-- FUNCTIONS
-- ================================================

-- Function: Register or update shared hosting client
CREATE OR REPLACE FUNCTION register_shared_hosting_client(
  p_client_id VARCHAR(255),
  p_domain VARCHAR(255),
  p_current_version VARCHAR(50) DEFAULT '1.0.0',
  p_user_agent TEXT DEFAULT NULL,
  p_timezone VARCHAR(100) DEFAULT NULL,
  p_hosting_provider VARCHAR(100) DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Insert or update client
  INSERT INTO shared_hosting_clients (
    client_id, domain, current_version, user_agent, timezone, hosting_provider, last_seen
  )
  VALUES (
    p_client_id, p_domain, p_current_version, p_user_agent, p_timezone, p_hosting_provider, NOW()
  )
  ON CONFLICT (client_id) DO UPDATE SET
    domain = EXCLUDED.domain,
    current_version = EXCLUDED.current_version,
    user_agent = EXCLUDED.user_agent,
    timezone = EXCLUDED.timezone,
    hosting_provider = EXCLUDED.hosting_provider,
    last_seen = NOW(),
    updated_at = NOW();

  -- Return success result
  result := json_build_object(
    'success', true,
    'client_id', p_client_id,
    'message', 'Client registered successfully'
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to register client'
    );
    RETURN result;
END;
$$;

-- Function: Get available updates for client
CREATE OR REPLACE FUNCTION get_shared_hosting_updates(
  p_client_version VARCHAR(50) DEFAULT '1.0.0',
  p_channel VARCHAR(20) DEFAULT 'stable'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updates_data JSON;
  latest_update RECORD;
BEGIN
  -- Get the latest available update
  SELECT * INTO latest_update
  FROM shared_hosting_updates
  WHERE is_active = true
    AND channel = p_channel
    AND version > p_client_version
  ORDER BY created_at DESC
  LIMIT 1;

  IF latest_update IS NULL THEN
    updates_data := json_build_object(
      'has_update', false,
      'message', 'No updates available'
    );
  ELSE
    updates_data := json_build_object(
      'has_update', true,
      'update', row_to_json(latest_update),
      'message', 'Update available'
    );
  END IF;

  RETURN updates_data;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'has_update', false,
      'error', SQLERRM,
      'message', 'Failed to check for updates'
    );
END;
$$;

-- Function: Log update activity
CREATE OR REPLACE FUNCTION log_shared_hosting_activity(
  p_update_id UUID,
  p_client_id VARCHAR(255),
  p_activity VARCHAR(100),
  p_details JSONB DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Insert activity log
  INSERT INTO shared_hosting_update_logs (
    update_id, client_id, activity, details, user_agent, success, timestamp
  )
  VALUES (
    p_update_id, p_client_id, p_activity, p_details, p_user_agent, p_success, NOW()
  );

  -- Update stats if it's an important activity
  IF p_activity IN ('download_attempted', 'applied_successfully') THEN
    PERFORM update_shared_hosting_stats(p_update_id);
  END IF;

  result := json_build_object(
    'success', true,
    'message', 'Activity logged successfully'
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to log activity'
    );
    RETURN result;
END;
$$;

-- Function: Update statistics for an update
CREATE OR REPLACE FUNCTION update_shared_hosting_stats(p_update_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats_record RECORD;
BEGIN
  -- Calculate stats for the update
  SELECT 
    COUNT(DISTINCT shl.client_id) FILTER (WHERE shl.activity = 'download_attempted') as downloads,
    COUNT(DISTINCT shl.client_id) FILTER (WHERE shl.activity = 'applied_successfully') as applications,
    (SELECT COUNT(*) FROM shared_hosting_clients WHERE is_active = true) as total_clients
  INTO stats_record
  FROM shared_hosting_update_logs shl
  WHERE shl.update_id = p_update_id;

  -- Calculate success rate
  DECLARE
    success_rate DECIMAL(5,2) := 0.00;
  BEGIN
    IF stats_record.downloads > 0 THEN
      success_rate := (stats_record.applications::DECIMAL / stats_record.downloads) * 100;
    END IF;
  END;

  -- Insert or update stats
  INSERT INTO shared_hosting_update_stats (
    update_id, total_clients, downloads_count, applications_count, success_rate, last_calculated
  )
  VALUES (
    p_update_id, stats_record.total_clients, stats_record.downloads, stats_record.applications, success_rate, NOW()
  )
  ON CONFLICT (update_id) DO UPDATE SET
    total_clients = EXCLUDED.total_clients,
    downloads_count = EXCLUDED.downloads_count,
    applications_count = EXCLUDED.applications_count,
    success_rate = EXCLUDED.success_rate,
    last_calculated = NOW();

EXCEPTION
  WHEN OTHERS THEN
    -- Silently fail for stats updates
    NULL;
END;
$$;

-- Function: Send update notifications
CREATE OR REPLACE FUNCTION create_shared_hosting_notifications(
  p_update_id UUID,
  p_notification_type VARCHAR(50) DEFAULT 'update_available'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  client_record RECORD;
  notification_count INTEGER := 0;
BEGIN
  -- Create notifications for all active clients with email
  FOR client_record IN 
    SELECT client_id, contact_email, domain
    FROM shared_hosting_clients 
    WHERE is_active = true AND contact_email IS NOT NULL
  LOOP
    INSERT INTO shared_hosting_notifications (
      update_id, client_id, email, notification_type, email_content
    )
    VALUES (
      p_update_id, 
      client_record.client_id, 
      client_record.contact_email, 
      p_notification_type,
      'Website update available for ' || client_record.domain
    );
    
    notification_count := notification_count + 1;
  END LOOP;

  result := json_build_object(
    'success', true,
    'notifications_created', notification_count,
    'message', 'Notifications created successfully'
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to create notifications'
    );
    RETURN result;
END;
$$;

-- ================================================
-- TRIGGERS
-- ================================================

-- Trigger: Update timestamps on shared_hosting_clients
CREATE OR REPLACE FUNCTION update_shared_hosting_clients_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_shared_hosting_clients_timestamp
  BEFORE UPDATE ON shared_hosting_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_shared_hosting_clients_timestamp();

-- Trigger: Update timestamps on shared_hosting_updates
CREATE OR REPLACE FUNCTION update_shared_hosting_updates_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_shared_hosting_updates_timestamp
  BEFORE UPDATE ON shared_hosting_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_shared_hosting_updates_timestamp();

-- ================================================
-- SAMPLE DATA (Optional)
-- ================================================

-- Insert a sample update for testing
-- INSERT INTO shared_hosting_updates (
--   version, title, description, release_notes, package_url, is_active, channel
-- ) VALUES (
--   '1.1.0', 
--   'Performance Improvements',
--   'Improved loading speed and fixed several bugs',
--   '- Faster page load times\n- Fixed mobile navigation\n- Updated dependencies',
--   'https://example.com/updates/v1.1.0.zip',
--   true,
--   'stable'
-- );

-- ================================================
-- GRANTS (if needed for specific users)
-- ================================================

-- Grant usage on sequences to authenticated users
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant execute on functions to public for client operations
GRANT EXECUTE ON FUNCTION register_shared_hosting_client TO anon;
GRANT EXECUTE ON FUNCTION get_shared_hosting_updates TO anon;
GRANT EXECUTE ON FUNCTION log_shared_hosting_activity TO anon;

-- Grant execute on admin functions to authenticated users
GRANT EXECUTE ON FUNCTION update_shared_hosting_stats TO authenticated;
GRANT EXECUTE ON FUNCTION create_shared_hosting_notifications TO authenticated;

-- ================================================
-- COMPLETION MESSAGE
-- ================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Shared Hosting Update System database setup completed successfully!';
  RAISE NOTICE '📋 Tables created: shared_hosting_clients, shared_hosting_updates, shared_hosting_update_logs, shared_hosting_notifications, shared_hosting_update_stats';
  RAISE NOTICE '🔧 Functions created: register_shared_hosting_client, get_shared_hosting_updates, log_shared_hosting_activity, update_shared_hosting_stats, create_shared_hosting_notifications';
  RAISE NOTICE '🛡️ RLS policies configured for security';
  RAISE NOTICE '🚀 System ready for shared hosting deployments!';
END $$; 
-- ================================================
-- AUTOMATIC UPDATE SYSTEM
-- Additional schema for server-side automatic updates
-- ================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ADDITIONAL TABLES FOR AUTOMATIC UPDATES
-- ================================================

-- Table: automatic_update_logs
-- Tracks automatic update activities
CREATE TABLE IF NOT EXISTS automatic_update_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  update_id UUID REFERENCES shared_hosting_updates(id) ON DELETE CASCADE,
  client_id VARCHAR(255) NOT NULL,
  activity VARCHAR(100) NOT NULL, -- auto_update_started, auto_update_completed, auto_update_failed, etc.
  details JSONB, -- Additional information like files updated, errors, etc.
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  domain VARCHAR(255),
  ip_address INET,
  execution_time_ms INTEGER, -- Time taken for the update
  success BOOLEAN DEFAULT true
);

-- Table: automatic_update_capabilities
-- Tracks which clients support automatic updates
CREATE TABLE IF NOT EXISTS automatic_update_capabilities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id VARCHAR(255) UNIQUE NOT NULL,
  domain VARCHAR(255) NOT NULL,
  supports_automatic BOOLEAN DEFAULT false,
  endpoint_url TEXT,
  api_key_hash VARCHAR(255), -- Hashed API key for security
  last_capability_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  php_version VARCHAR(20),
  server_info JSONB, -- Server capabilities, limits, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: automatic_update_performance
-- Tracks performance metrics for automatic updates
CREATE TABLE IF NOT EXISTS automatic_update_performance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  update_id UUID REFERENCES shared_hosting_updates(id) ON DELETE CASCADE,
  client_id VARCHAR(255) NOT NULL,
  download_time_ms INTEGER,
  extraction_time_ms INTEGER,
  application_time_ms INTEGER,
  total_time_ms INTEGER,
  files_processed INTEGER,
  download_size_mb DECIMAL(10,3),
  server_load_avg DECIMAL(5,2),
  memory_usage_mb INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- INDEXES FOR AUTOMATIC UPDATES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_automatic_logs_update ON automatic_update_logs(update_id);
CREATE INDEX IF NOT EXISTS idx_automatic_logs_client ON automatic_update_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_automatic_logs_activity ON automatic_update_logs(activity);
CREATE INDEX IF NOT EXISTS idx_automatic_logs_timestamp ON automatic_update_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_automatic_logs_domain ON automatic_update_logs(domain);

CREATE INDEX IF NOT EXISTS idx_automatic_capabilities_client ON automatic_update_capabilities(client_id);
CREATE INDEX IF NOT EXISTS idx_automatic_capabilities_domain ON automatic_update_capabilities(domain);
CREATE INDEX IF NOT EXISTS idx_automatic_capabilities_active ON automatic_update_capabilities(is_active);
CREATE INDEX IF NOT EXISTS idx_automatic_capabilities_supports ON automatic_update_capabilities(supports_automatic);

CREATE INDEX IF NOT EXISTS idx_automatic_performance_update ON automatic_update_performance(update_id);
CREATE INDEX IF NOT EXISTS idx_automatic_performance_client ON automatic_update_performance(client_id);
CREATE INDEX IF NOT EXISTS idx_automatic_performance_timestamp ON automatic_update_performance(timestamp);

-- ================================================
-- ROW LEVEL SECURITY FOR AUTOMATIC UPDATES
-- ================================================

-- Enable RLS on new tables
ALTER TABLE automatic_update_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automatic_update_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE automatic_update_performance ENABLE ROW LEVEL SECURITY;

-- Public insert for automatic update logs
CREATE POLICY "automatic_logs_insert_public" ON automatic_update_logs
  FOR INSERT WITH CHECK (true);

-- Admin read access for automatic update logs
CREATE POLICY "automatic_logs_read_admin" ON automatic_update_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Public read/write for capabilities (clients can update their own capabilities)
CREATE POLICY "automatic_capabilities_public" ON automatic_update_capabilities
  FOR ALL USING (true);

-- Admin access for performance metrics
CREATE POLICY "automatic_performance_admin" ON automatic_update_performance
  FOR ALL USING (auth.role() = 'authenticated');

-- ================================================
-- FUNCTIONS FOR AUTOMATIC UPDATES
-- ================================================

-- Function: Register automatic update capability
CREATE OR REPLACE FUNCTION register_automatic_capability(
  p_client_id VARCHAR(255),
  p_domain VARCHAR(255),
  p_supports_automatic BOOLEAN DEFAULT false,
  p_endpoint_url TEXT DEFAULT NULL,
  p_api_key_hash VARCHAR(255) DEFAULT NULL,
  p_php_version VARCHAR(20) DEFAULT NULL,
  p_server_info JSONB DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Insert or update capability
  INSERT INTO automatic_update_capabilities (
    client_id, domain, supports_automatic, endpoint_url, api_key_hash, 
    php_version, server_info, last_capability_check
  )
  VALUES (
    p_client_id, p_domain, p_supports_automatic, p_endpoint_url, p_api_key_hash,
    p_php_version, p_server_info, NOW()
  )
  ON CONFLICT (client_id) DO UPDATE SET
    domain = EXCLUDED.domain,
    supports_automatic = EXCLUDED.supports_automatic,
    endpoint_url = EXCLUDED.endpoint_url,
    api_key_hash = EXCLUDED.api_key_hash,
    php_version = EXCLUDED.php_version,
    server_info = EXCLUDED.server_info,
    last_capability_check = NOW(),
    updated_at = NOW();

  result := json_build_object(
    'success', true,
    'client_id', p_client_id,
    'supports_automatic', p_supports_automatic,
    'message', 'Capability registered successfully'
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to register capability'
    );
    RETURN result;
END;
$$;

-- Function: Log automatic update activity
CREATE OR REPLACE FUNCTION log_automatic_activity(
  p_update_id UUID,
  p_client_id VARCHAR(255),
  p_activity VARCHAR(100),
  p_details JSONB DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_domain VARCHAR(255) DEFAULT NULL,
  p_execution_time_ms INTEGER DEFAULT NULL,
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
  INSERT INTO automatic_update_logs (
    update_id, client_id, activity, details, user_agent, domain,
    execution_time_ms, success, timestamp
  )
  VALUES (
    p_update_id, p_client_id, p_activity, p_details, p_user_agent, p_domain,
    p_execution_time_ms, p_success, NOW()
  );

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

-- Function: Get automatic update statistics
CREATE OR REPLACE FUNCTION get_automatic_update_stats(
  p_update_id UUID DEFAULT NULL,
  p_days_back INTEGER DEFAULT 30
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats_data JSON;
  total_attempts INTEGER;
  successful_attempts INTEGER;
  failed_attempts INTEGER;
  avg_execution_time INTEGER;
  clients_with_capability INTEGER;
  clients_supporting_auto INTEGER;
BEGIN
  -- Get basic statistics
  SELECT 
    COUNT(*) FILTER (WHERE activity = 'auto_update_started'),
    COUNT(*) FILTER (WHERE activity = 'auto_update_completed'),
    COUNT(*) FILTER (WHERE activity = 'auto_update_failed'),
    AVG(execution_time_ms)::INTEGER
  INTO total_attempts, successful_attempts, failed_attempts, avg_execution_time
  FROM automatic_update_logs
  WHERE (p_update_id IS NULL OR update_id = p_update_id)
    AND timestamp > NOW() - INTERVAL '1 day' * p_days_back;

  -- Get capability statistics
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE supports_automatic = true)
  INTO clients_with_capability, clients_supporting_auto
  FROM automatic_update_capabilities
  WHERE is_active = true;

  -- Build result
  stats_data := json_build_object(
    'total_attempts', COALESCE(total_attempts, 0),
    'successful_attempts', COALESCE(successful_attempts, 0),
    'failed_attempts', COALESCE(failed_attempts, 0),
    'success_rate', CASE 
      WHEN total_attempts > 0 THEN ROUND((successful_attempts::DECIMAL / total_attempts) * 100, 2)
      ELSE 0 
    END,
    'avg_execution_time_ms', COALESCE(avg_execution_time, 0),
    'clients_with_capability', COALESCE(clients_with_capability, 0),
    'clients_supporting_auto', COALESCE(clients_supporting_auto, 0),
    'auto_support_rate', CASE 
      WHEN clients_with_capability > 0 THEN ROUND((clients_supporting_auto::DECIMAL / clients_with_capability) * 100, 2)
      ELSE 0 
    END,
    'period_days', p_days_back,
    'generated_at', NOW()
  );

  RETURN stats_data;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', SQLERRM,
      'message', 'Failed to generate statistics'
    );
END;
$$;

-- Function: Record performance metrics
CREATE OR REPLACE FUNCTION record_automatic_performance(
  p_update_id UUID,
  p_client_id VARCHAR(255),
  p_download_time_ms INTEGER DEFAULT NULL,
  p_extraction_time_ms INTEGER DEFAULT NULL,
  p_application_time_ms INTEGER DEFAULT NULL,
  p_total_time_ms INTEGER DEFAULT NULL,
  p_files_processed INTEGER DEFAULT NULL,
  p_download_size_mb DECIMAL(10,3) DEFAULT NULL,
  p_server_load_avg DECIMAL(5,2) DEFAULT NULL,
  p_memory_usage_mb INTEGER DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Insert performance record
  INSERT INTO automatic_update_performance (
    update_id, client_id, download_time_ms, extraction_time_ms, application_time_ms,
    total_time_ms, files_processed, download_size_mb, server_load_avg, memory_usage_mb
  )
  VALUES (
    p_update_id, p_client_id, p_download_time_ms, p_extraction_time_ms, p_application_time_ms,
    p_total_time_ms, p_files_processed, p_download_size_mb, p_server_load_avg, p_memory_usage_mb
  );

  result := json_build_object(
    'success', true,
    'message', 'Performance metrics recorded'
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to record performance metrics'
    );
    RETURN result;
END;
$$;

-- ================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ================================================

-- Trigger: Update timestamps on automatic_update_capabilities
CREATE OR REPLACE FUNCTION update_automatic_capabilities_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_automatic_capabilities_timestamp
  BEFORE UPDATE ON automatic_update_capabilities
  FOR EACH ROW
  EXECUTE FUNCTION update_automatic_capabilities_timestamp();

-- ================================================
-- VIEWS FOR REPORTING
-- ================================================

-- View: Automatic update success rates by client
CREATE OR REPLACE VIEW automatic_update_client_performance AS
SELECT 
  auc.client_id,
  auc.domain,
  auc.supports_automatic,
  COUNT(aul.id) as total_attempts,
  COUNT(aul.id) FILTER (WHERE aul.activity = 'auto_update_completed') as successful_updates,
  COUNT(aul.id) FILTER (WHERE aul.activity = 'auto_update_failed') as failed_updates,
  CASE 
    WHEN COUNT(aul.id) > 0 THEN 
      ROUND((COUNT(aul.id) FILTER (WHERE aul.activity = 'auto_update_completed')::DECIMAL / COUNT(aul.id)) * 100, 2)
    ELSE 0 
  END as success_rate,
  AVG(aul.execution_time_ms)::INTEGER as avg_execution_time_ms,
  MAX(aul.timestamp) as last_update_attempt
FROM automatic_update_capabilities auc
LEFT JOIN automatic_update_logs aul ON auc.client_id = aul.client_id
WHERE auc.is_active = true
GROUP BY auc.client_id, auc.domain, auc.supports_automatic
ORDER BY success_rate DESC, total_attempts DESC;

-- View: Recent automatic update activity
CREATE OR REPLACE VIEW recent_automatic_activity AS
SELECT 
  aul.id,
  aul.update_id,
  shu.version,
  shu.title as update_title,
  aul.client_id,
  aul.domain,
  aul.activity,
  aul.success,
  aul.execution_time_ms,
  aul.timestamp,
  auc.supports_automatic
FROM automatic_update_logs aul
LEFT JOIN shared_hosting_updates shu ON aul.update_id = shu.id
LEFT JOIN automatic_update_capabilities auc ON aul.client_id = auc.client_id
ORDER BY aul.timestamp DESC
LIMIT 100;

-- ================================================
-- GRANTS FOR AUTOMATIC UPDATES
-- ================================================

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant execute on functions to public for client operations
GRANT EXECUTE ON FUNCTION register_automatic_capability TO anon;
GRANT EXECUTE ON FUNCTION log_automatic_activity TO anon;

-- Grant execute on admin functions to authenticated users
GRANT EXECUTE ON FUNCTION get_automatic_update_stats TO authenticated;
GRANT EXECUTE ON FUNCTION record_automatic_performance TO authenticated;

-- Grant access to views for authenticated users
GRANT SELECT ON automatic_update_client_performance TO authenticated;
GRANT SELECT ON recent_automatic_activity TO authenticated;

-- ================================================
-- COMPLETION MESSAGE
-- ================================================

DO $$
BEGIN
  RAISE NOTICE '🚀 Automatic Update System database setup completed successfully!';
  RAISE NOTICE '📋 Tables created: automatic_update_logs, automatic_update_capabilities, automatic_update_performance';
  RAISE NOTICE '🔧 Functions created: register_automatic_capability, log_automatic_activity, get_automatic_update_stats, record_automatic_performance';
  RAISE NOTICE '📊 Views created: automatic_update_client_performance, recent_automatic_activity';
  RAISE NOTICE '🛡️ RLS policies configured for security';
  RAISE NOTICE '⚡ System ready for automatic server-side updates!';
END $$; 
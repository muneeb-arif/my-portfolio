-- =====================================================
-- CREATE DOMAINS TABLE
-- =====================================================

-- Create domains table
CREATE TABLE IF NOT EXISTS domains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  status TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_name (name),
  INDEX idx_status (status),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Insert sample domains for existing users
INSERT INTO domains (user_id, name, status, created_at, updated_at) VALUES 
  ('e2e23b4c-2468-43b9-b12d-9bf73065d063', 'http://localhost:3000', 1, '2025-07-11 20:55:42', '2025-07-11 20:55:42'),
  ('e2e23b4c-2468-43b9-b12d-9bf73065d063', 'http://muneeb.theexpertways.com', 1, '2025-07-11 20:55:42', '2025-07-11 20:55:42'),
  ('94b101ed-9705-4a18-b25b-ef7376ad0550', 'http://ahsan.theexpertways.com', 1, '2025-07-11 20:55:42', '2025-07-11 20:55:42'),
  ('9b054eaf-9a7c-483b-8915-84c439b3ae79', 'http://dev.theexpertways.com', 1, '2025-07-11 20:55:42', '2025-07-11 20:55:42'),
  ('033f0150-6671-41e5-a968-ff40e9f07f26', 'http://fareed.theexpertways.com', 1, '2025-07-11 20:55:42', '2025-07-11 20:55:42'),
  ('4ef76b96-d00c-4895-a109-0dc729b4bc46', 'http://imaamir.theexpertways.com', 1, '2025-07-11 20:55:42', '2025-07-11 20:55:42'),
  ('72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'http://khumi.theexpertways.com', 1, '2025-07-11 20:55:42', '2025-07-11 20:55:42'),
  ('3fb36cdb-e2b9-4f78-bd3b-2bf5de0168e6', 'http://test.theexpertways.com', 1, '2025-07-11 20:55:42', '2025-07-11 20:55:42'),
  ('1b437fd2-8576-44b0-b49e-741a0befe6a4', 'http://theexpertways.com', 1, '2025-07-11 20:55:42', '2025-07-11 20:55:42'),
  ('2f660a9a-3538-4384-970c-53b4bd37d4a8', 'http://zm.theexpertways.com', 1, '2025-07-11 20:55:42', '2025-07-11 20:55:42');

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Verify the table was created and data was inserted
SELECT 
    d.id,
    d.user_id,
    d.name,
    d.status,
    d.created_at,
    u.email as user_email
FROM domains d
JOIN users u ON d.user_id = u.id
ORDER BY d.id; 
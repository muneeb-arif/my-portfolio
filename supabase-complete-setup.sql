-- =====================================================
-- 🚀 COMPLETE SUPABASE SETUP FOR PORTFOLIO DASHBOARD
-- =====================================================
-- Copy and paste this entire script into Supabase SQL Editor
-- This script creates all necessary tables, policies, and storage setup

-- =====================================================
-- 1. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- =====================================================
-- 2. CREATE CORE TABLES
-- =====================================================

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  overview TEXT,
  technologies TEXT[],
  features TEXT[],
  live_url TEXT,
  github_url TEXT,
  status TEXT DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project images table
CREATE TABLE IF NOT EXISTS project_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  name TEXT NOT NULL,
  original_name TEXT,
  size INTEGER,
  type TEXT,
  bucket TEXT DEFAULT 'images',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table (updated with better structure)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#8B4513',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Technologies table
CREATE TABLE IF NOT EXISTS technologies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Domains and Technologies table (simplified)
CREATE TABLE IF NOT EXISTS domains_technologies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT CHECK (type IN ('domain', 'technology')) DEFAULT 'technology',
  title TEXT NOT NULL,
  icon TEXT,
  image TEXT,
  sort_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Technology Skills table (simplified)
CREATE TABLE IF NOT EXISTS tech_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tech_id UUID REFERENCES domains_technologies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Niche table for domains/niches
CREATE TABLE IF NOT EXISTS niche (
  id SERIAL PRIMARY KEY,
  image VARCHAR NOT NULL DEFAULT 'default.jpeg',
  title VARCHAR NOT NULL,
  overview TEXT DEFAULT '',
  tools TEXT DEFAULT '',
  key_features TEXT,
  sort_order INTEGER DEFAULT 1,
  ai_driven BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

-- Index for niche sorting
CREATE INDEX IF NOT EXISTS idx_niche_sort_order ON niche(sort_order);

-- Index for domains_technologies sorting
CREATE INDEX IF NOT EXISTS idx_domains_technologies_sort_order ON domains_technologies(sort_order);

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE niche ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Project images policies
CREATE POLICY "Users can view own project images" ON project_images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own project images" ON project_images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own project images" ON project_images FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own project images" ON project_images FOR DELETE USING (auth.uid() = user_id);

-- Categories policies (public read, authenticated write)
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON categories FOR DELETE USING (auth.role() = 'authenticated');

-- Technologies policies
CREATE POLICY "Users can view own technologies" ON technologies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own technologies" ON technologies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own technologies" ON technologies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own technologies" ON technologies FOR DELETE USING (auth.uid() = user_id);

-- Domains_technologies policies
CREATE POLICY "Users can view own domains_technologies" ON domains_technologies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own domains_technologies" ON domains_technologies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own domains_technologies" ON domains_technologies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own domains_technologies" ON domains_technologies FOR DELETE USING (auth.uid() = user_id);

-- Tech_skills policies
CREATE POLICY "Users can view own tech_skills" ON tech_skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tech_skills" ON tech_skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tech_skills" ON tech_skills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tech_skills" ON tech_skills FOR DELETE USING (auth.uid() = user_id);

-- Niche policies (public read, authenticated write)
CREATE POLICY "Allow public read access to niche" ON niche FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage niche" ON niche FOR ALL USING (auth.role() = 'authenticated');

-- Settings policies
CREATE POLICY "Users can view own settings" ON settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON settings FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 6. INSERT DEFAULT DATA
-- =====================================================

-- Insert default categories
INSERT INTO categories (name, description, color) VALUES 
  ('Web Development', 'Full-stack web applications and websites', '#3b82f6'),
  ('UI/UX Design', 'User interface and user experience design', '#8b5cf6'),
  ('Backend', 'Server-side applications and APIs', '#ef4444'),
  ('Mobile App', 'iOS and Android mobile applications', '#10b981'),
  ('Data Science', 'Machine learning and data analysis projects', '#f59e0b'),
  ('DevOps', 'Infrastructure and deployment automation', '#6b7280')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 7. CREATE TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for tables with updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_niche_updated_at BEFORE UPDATE ON niche
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domains_technologies_updated_at BEFORE UPDATE ON domains_technologies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tech_skills_updated_at BEFORE UPDATE ON tech_skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. SET UP STORAGE
-- =====================================================

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the images bucket
CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Allow authenticated users to upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update their own files" ON storage.objects FOR UPDATE USING (bucket_id = 'images' AND auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete their own files" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- =====================================================
-- ✅ SETUP COMPLETE!
-- =====================================================
-- Your Supabase database is now ready for the portfolio dashboard!
-- All tables, policies, and storage are configured. 
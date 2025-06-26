-- Supabase Database Setup for Portfolio Dashboard
-- Copy and paste this entire script into Supabase SQL Editor

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

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

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#667eea',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  sort_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Technology Skills table (simplified)
CREATE TABLE IF NOT EXISTS tech_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tech_id UUID REFERENCES domains_technologies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  icon TEXT,
  level DECIMAL(10,2) DEFAULT 0.00,
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

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Create policies for project_images
CREATE POLICY "Users can view own project images" ON project_images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own project images" ON project_images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own project images" ON project_images FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own project images" ON project_images FOR DELETE USING (auth.uid() = user_id);

-- Create policies for categories
CREATE POLICY "Users can view own categories" ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid() = user_id);

-- Create policies for technologies
CREATE POLICY "Users can view own technologies" ON technologies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own technologies" ON technologies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own technologies" ON technologies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own technologies" ON technologies FOR DELETE USING (auth.uid() = user_id);

-- Create policies for domains_technologies
CREATE POLICY "Users can view own domains_technologies" ON domains_technologies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own domains_technologies" ON domains_technologies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own domains_technologies" ON domains_technologies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own domains_technologies" ON domains_technologies FOR DELETE USING (auth.uid() = user_id);

-- Create policies for tech_skills
CREATE POLICY "Users can view own tech_skills" ON tech_skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tech_skills" ON tech_skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tech_skills" ON tech_skills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tech_skills" ON tech_skills FOR DELETE USING (auth.uid() = user_id);

-- Create policies for settings
CREATE POLICY "Users can view own settings" ON settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON settings FOR DELETE USING (auth.uid() = user_id); 
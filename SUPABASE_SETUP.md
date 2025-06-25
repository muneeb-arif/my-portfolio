# 🚀 Supabase Dashboard Setup Guide

This guide will walk you through setting up Supabase for your portfolio dashboard in **5 simple steps**.

## 📋 Prerequisites

- A [Supabase account](https://supabase.com) (free tier available)
- Your portfolio project code (which you already have!)

---

## 🎯 Step 1: Create Supabase Project

1. **Sign up/Login** to [Supabase](https://supabase.com)
2. Click **"New Project"**
3. Choose your organization
4. Fill in project details:
   - **Name**: `portfolio-dashboard` (or any name you prefer)
   - **Database Password**: Create a strong password and **save it**
   - **Region**: Choose closest to your location
5. Click **"Create new project"**
6. ⏳ Wait 2-3 minutes for setup to complete

---

## 🔑 Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xyzabc123.supabase.co`)
   - **Anon key** (looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

3. **Update your configuration**:
   - Open `src/config/supabase.js`
   - Replace the placeholder values:

```javascript
const supabaseUrl = 'https://your-project-id.supabase.co';
const supabaseAnonKey = 'your-anon-key-here';
```

---

## 🗄️ Step 3: Create Database Tables

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste this SQL script:

```sql
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

-- Create policies for settings
CREATE POLICY "Users can view own settings" ON settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON settings FOR DELETE USING (auth.uid() = user_id);
```

3. Click **"Run"** to execute the script

---

## 🔐 Step 4: Configure Authentication

1. Go to **Authentication** → **Settings**
2. **Enable Email Authentication** (should be enabled by default)
3. **Optional**: Configure additional providers (Google, GitHub, etc.)
4. In **Email Templates**, you can customize signup/login emails

### 📧 Email Settings (Optional)
- For production, configure SMTP settings
- For development, the default email service works fine

---

## 🗂️ Step 5: Set Up Storage (Optional)

If you want to upload images to Supabase Storage:

1. Go to **Storage** → **Settings**
2. Create a new bucket:
   - **Name**: `images`
   - **Public**: ✅ Enabled
3. Set up storage policies:

```sql
-- Storage policies
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Users can upload own images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## ✅ Step 6: Test Your Setup

1. **Start your development server**:
   ```bash
   npm start
   ```

2. **Navigate to the dashboard**:
   ```
   http://localhost:3000/dashboard
   ```

3. **Test the features**:
   - ✅ Sign up with a new email
   - ✅ Check your email for verification
   - ✅ Sign in to the dashboard
   - ✅ Navigate through different sections

---

## 🎉 You're All Set!

Your Supabase dashboard is now ready! Here's what you can do:

### 🚀 **Access Your Dashboard**
- **Portfolio**: `http://localhost:3000/`
- **Dashboard**: `http://localhost:3000/dashboard`

### 📊 **Dashboard Features**
- **📊 Overview**: Stats and recent projects
- **💼 Projects**: Create, edit, and manage projects
- **🖼️ Media**: Upload and organize images
- **📁 Categories**: Organize project categories
- **🎨 Appearance**: Customize your portfolio
- **⚙️ Settings**: Account management
- **📦 Export**: Backup and restore data

---

## 🔧 Troubleshooting

### **Can't connect to Supabase?**
- ✅ Check your API keys in `src/config/supabase.js`
- ✅ Make sure the project URL is correct
- ✅ Verify your internet connection

### **Authentication not working?**
- ✅ Check if email auth is enabled in Supabase
- ✅ Look at browser console for error messages
- ✅ Verify email verification (check spam folder)

### **Database errors?**
- ✅ Ensure all tables are created (run SQL script again)
- ✅ Check Row Level Security policies
- ✅ Verify user permissions

### **Storage issues?**
- ✅ Create the `images` bucket
- ✅ Set bucket to public
- ✅ Check storage policies

---

## 🌟 Next Steps

1. **Customize**: Modify the dashboard to fit your needs
2. **Deploy**: Deploy to Vercel, Netlify, or your preferred platform
3. **Domain**: Add a custom domain for production
4. **Features**: Add more sections and functionality

---

## 📚 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Dashboard](https://app.supabase.com)
- [React Documentation](https://reactjs.org/docs)

---

**🎯 Pro Tip**: Bookmark your Supabase project URL for quick access to your dashboard!

Happy coding! 🚀 
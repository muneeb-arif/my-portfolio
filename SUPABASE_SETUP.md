# 🚀 Supabase Dashboard Setup Guide

This guide will walk you through setting up Supabase for your portfolio dashboard in **4 simple steps**.

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

## 🗄️ Step 3: Complete Database Setup

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the entire content from `supabase-complete-setup.sql` file
3. Paste it into the SQL Editor
4. Click **"Run"** to execute the script

**What this script does:**
- ✅ Creates all necessary tables (projects, categories, technologies, niches, etc.)
- ✅ Sets up Row Level Security (RLS) policies
- ✅ Creates storage bucket and policies
- ✅ Inserts default categories
- ✅ Sets up triggers and functions
- ✅ Configures all permissions

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

## ✅ Step 5: Test Your Setup

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
- **🎯 Domains/Niche**: Manage domain expertise areas
- **⚙️ Technologies**: Manage technologies and skills
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
- ✅ The `images` bucket is created automatically by the script
- ✅ Check storage policies in Supabase dashboard

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

## 📁 File Structure

```
portfolio-1/
├── supabase-complete-setup.sql    # Complete database setup
├── src/
│   ├── config/
│   │   └── supabase.js            # Supabase configuration
│   ├── services/
│   │   └── supabaseService.js     # Database operations
│   └── components/
│       └── dashboard/             # Dashboard components
└── SUPABASE_SETUP.md              # This setup guide
```

---

**🎯 Pro Tip**: Bookmark your Supabase project URL for quick access to your dashboard!

Happy coding! 🚀 
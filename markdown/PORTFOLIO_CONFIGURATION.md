# 🎯 Portfolio Configuration Guide

This guide explains how to configure your portfolio to display data from a specific user account, ensuring that only your projects and settings are shown publicly.

## 📋 Overview

The portfolio system now includes **enhanced data filtering** that ensures only the configured portfolio owner's data is displayed publicly. This provides better security and user experience by:

- **Database-Level Filtering**: Uses Row Level Security (RLS) policies to filter data at the database level
- **Automatic Configuration**: Automatically sets up the portfolio owner based on your environment variable
- **Multi-User Support**: Allows multiple users in the database while only showing the configured owner's data publicly
- **Secure Public Access**: Only published projects and non-sensitive settings are accessible publicly

## 🔧 Configuration Steps

### Step 1: Database Setup (Required)

First, you need to run the database setup script to create the necessary policies and functions:

1. **Open Supabase SQL Editor**:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor

2. **Run the Setup Script**:
   - Copy the contents of `public-access-policies.sql`
   - Paste and execute in the SQL Editor
   - This creates:
     - Portfolio configuration table
     - User filtering functions
     - Row Level Security policies
     - Helper functions for data access

3. **Verify Setup**:
   - The script includes verification queries at the end
   - Check that all policies were created successfully

### Step 2: Environment Configuration

Create a `.env` file in your project root (use `env.example` as a template):

```env
REACT_APP_SUPABASE_URL=your-project-url.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
REACT_APP_PORTFOLIO_OWNER_EMAIL=your-email@example.com
```

**Important**: Use the exact email address that you used to sign up for your Supabase account.

### Step 3: Automatic Configuration

Once you set the environment variable and restart your app:

1. **Automatic Detection**: The app automatically detects your portfolio owner email
2. **Database Configuration**: On first load, it configures the database to show only your data
3. **Verification**: Check the browser console for confirmation messages

### Step 4: How It Works

The portfolio now uses intelligent data loading that adapts based on the context:

1. **🔐 Dashboard Mode** (when authenticated)
   - **URL**: `/dashboard`
   - **Data**: Shows your own data for editing
   - **Access**: Requires authentication

2. **🌐 Public Mode** (when not authenticated)
   - **URL**: `/` (main portfolio)
   - **Data**: Shows data from the configured portfolio owner email only
   - **Access**: No authentication required
   - **Filtering**: Database-level filtering ensures only the owner's data is visible

3. **📊 Fallback Mode** (when database unavailable)
   - **Trigger**: Database connection issues
   - **Data**: Shows sample demo data
   - **Notification**: Displays fallback notification to visitors

### Step 5: Populate Your Data

1. **Access the dashboard**: `http://localhost:3000/dashboard`
2. **Sign in** with your credentials
3. **Add your content**:
   - 📊 Projects (make sure to set status to "Published")
   - 🎯 Technologies and Skills
   - 🏆 Domains/Niches
   - 📁 Categories
   - ⚙️ Appearance Settings

### Step 6: Test Your Configuration

1. **Visit the public portfolio**: `http://localhost:3000/`
2. **Verify your data is showing**:
   - Projects should display (only published ones)
   - Technologies should show with skills
   - Domains/Niches should be visible
   - Settings should reflect your customizations

## 🔍 Troubleshooting

### ❌ "No user found with email" Error

**Problem**: The email in your `.env` file doesn't match any user in your Supabase auth system.

**Solution**:
1. Check that you've signed up for an account in the dashboard (`/dashboard`)
2. Verify the email in your `.env` file matches exactly (case-sensitive)
3. Ensure you've confirmed your email address if email confirmation is enabled

### ❌ Still Showing All Users' Data

**Problem**: Database policies weren't set up correctly or configuration failed.

**Solutions**:
1. Re-run the `public-access-policies.sql` script in Supabase SQL Editor
2. Check the browser console for configuration error messages
3. Verify the portfolio configuration in the database:
   ```sql
   SELECT * FROM portfolio_config WHERE is_active = true;
   ```
4. Manually configure if needed:
   ```sql
   INSERT INTO portfolio_config (owner_email, owner_user_id) 
   VALUES ('your-email@example.com', get_user_id_by_email('your-email@example.com'))
   ON CONFLICT (owner_email) 
   DO UPDATE SET 
     owner_user_id = get_user_id_by_email('your-email@example.com'),
     is_active = true,
     updated_at = NOW();
   ```

### ❌ Data Not Loading (Empty Portfolio)

**Possible Causes**:
1. **No Published Projects**: Ensure you have projects with status = 'published'
2. **Configuration Issue**: Check browser console for setup error messages
3. **Database Access**: Verify Supabase connection and policies

**Solutions**:
1. Go to `/dashboard` and publish some projects
2. Check browser console for detailed error messages
3. Verify environment variables are correctly set

### ❌ Environment Variables Not Working

**Problem**: Changes to `.env` file not taking effect.

**Solution**:
1. Restart your development server completely
2. Clear browser cache
3. Verify `.env` file is in the project root
4. Check that variables start with `REACT_APP_`

## How Data Loading Works

The portfolio now uses intelligent data loading that adapts based on the context:

### 🔐 **Dashboard Mode** (when authenticated)
- **URL**: `/dashboard`
- **Data**: Shows your own data for editing
- **Access**: Requires authentication

### 🌐 **Public Mode** (when not authenticated)
- **URL**: `/` (main portfolio)
- **Data**: Shows data from the configured portfolio owner email only
- **Access**: No authentication required
- **Filtering**: Database-level filtering ensures only the owner's data is visible

### 📊 **Fallback Mode** (when database unavailable)
- **Trigger**: Database connection issues
- **Data**: Shows sample demo data
- **Notification**: Displays fallback notification to visitors

## Database Filtering Details

The enhanced system uses database-level filtering through:

### Row Level Security (RLS) Policies

1. **Projects**: Only published projects from the portfolio owner
2. **Project Images**: Only images from published projects of the portfolio owner  
3. **Domains/Technologies**: Only domains and tech skills from the portfolio owner
4. **Settings**: Only non-sensitive settings from the portfolio owner
5. **Categories & Niches**: Global data (available to all users)

### Security Benefits

- **Data Isolation**: Each user's data is completely isolated
- **Public Safety**: Only published and non-sensitive data is accessible publicly
- **User Privacy**: Private projects and sensitive settings remain protected
- **Multi-User Ready**: Multiple users can use the same database safely

## Multi-User Scenarios

### Multiple Portfolios on Same Database

The system supports multiple users sharing the same Supabase database:

1. **Each User Gets Their Own Data**: RLS policies ensure complete data isolation
2. **Public Portfolio Selection**: Only the configured owner's data shows publicly
3. **Dashboard Access**: Each user sees only their own data when authenticated

### Changing Portfolio Owner

To switch which user's data is displayed publicly:

1. Update `REACT_APP_PORTFOLIO_OWNER_EMAIL` in your `.env` file
2. Restart your application
3. The system will automatically reconfigure on next load

## Advanced Configuration

### Manual Database Configuration

If you need to manually configure the portfolio owner:

```sql
-- Set a specific user as the portfolio owner
INSERT INTO portfolio_config (owner_email, owner_user_id) 
VALUES ('user@example.com', get_user_id_by_email('user@example.com'))
ON CONFLICT (owner_email) 
DO UPDATE SET 
  owner_user_id = get_user_id_by_email('user@example.com'),
  is_active = true,
  updated_at = NOW();
```

### Viewing Current Configuration

```sql
-- Check current portfolio configuration
SELECT 
  pc.*,
  au.email as user_email
FROM portfolio_config pc
LEFT JOIN auth.users au ON pc.owner_user_id = au.id
WHERE pc.is_active = true;
```

## 📚 File Structure

```
src/
├── config/
│   └── portfolio.js          # Portfolio configuration
├── services/
│   ├── portfolioService.js   # Public data fetching
│   └── supabaseService.js    # Database operations
└── components/
    ├── Technologies.js       # Uses public data
    ├── DomainsNiche.js      # Uses public data
    └── ...

public-access-policies.sql    # RLS policies for public access
```

## 🚀 Deployment Notes

When deploying to production:

1. **Update the configuration** with your production user ID
2. **Run the RLS policies** on your production database
3. **Verify all data is published** and visible
4. **Test the live site** to ensure everything works

## 🔐 Security Notes

- ✅ **Only published projects** are visible to the public
- ✅ **Sensitive settings** (like admin settings) are not publicly accessible
- ✅ **User authentication** is still required for dashboard access
- ✅ **RLS policies** protect private data while allowing public read access

## 📞 Support

If you encounter issues:

1. **Check the browser console** for error messages
2. **Verify your Supabase connection** and credentials
3. **Ensure RLS policies are applied** correctly
4. **Test with fallback data first** to isolate the issue

---

**🎯 Pro Tip**: Use the Sync button in the dashboard to quickly populate your database with sample data for testing! 
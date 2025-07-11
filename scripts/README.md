# 🔄 Supabase to MySQL Migration Guide

This directory contains scripts to migrate your portfolio data from Supabase (PostgreSQL) to MySQL.

## 📋 Prerequisites

1. **Node.js** (v14 or higher)
2. **MySQL Server** (v5.7 or higher, MySQL 8.0 recommended)
3. **Access to your Supabase project**
4. **MySQL database created and schema applied**

## 🚀 Quick Start

### 1. Install Dependencies

From the `scripts/` directory:

```bash
cd scripts/
npm install
```

### 2. Set Environment Variables

Copy the main project's `.env` file or create one with these variables:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Optional but recommended

# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=portfolio_db

# Portfolio Owner
REACT_APP_PORTFOLIO_OWNER_EMAIL=your-email@example.com
```

### 3. Prepare MySQL Database

Create your MySQL database and run the schema:

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE portfolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Apply schema
mysql -u root -p portfolio_db < ../mysql_database_schema.sql
```

### 4. Test Connections

Before migration, test both database connections:

```bash
npm run test-connection
```

This will verify:
- ✅ Supabase connection and table access
- ✅ MySQL connection and required tables exist

### 5. Run Migration

If tests pass, run the migration:

```bash
npm run migrate
```

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `migrate-to-mysql.js` | Main migration script |
| `test-connections.js` | Database connection tester |
| `package.json` | Node.js dependencies |
| `README.md` | This documentation |

## 🔧 Migration Process

The migration script handles these tables in order:

1. **users** - Creates portfolio owner user
2. **portfolio_config** - Sets up portfolio configuration
3. **categories** - Project categories
4. **projects** - Portfolio projects
5. **project_images** - Project image files
6. **technologies** - Technology entries
7. **domains_technologies** - Domain/tech classifications
8. **tech_skills** - Technology skill levels
9. **niche** - Niche/domain information
10. **settings** - Application settings
11. **contact_queries** - Contact form submissions

## 🛠️ Data Transformations

### PostgreSQL → MySQL Conversions:

| PostgreSQL Type | MySQL Type | Notes |
|----------------|------------|-------|
| `UUID` | `VARCHAR(36)` | Uses UUID() function |
| `JSONB` | `JSON` | Native JSON support |
| `TEXT[]` | `JSON` | Arrays converted to JSON |
| `TIMESTAMPTZ` | `TIMESTAMP` | UTC timezone |
| `BIGSERIAL` | `BIGINT AUTO_INCREMENT` | Auto-incrementing IDs |

### Key Changes:

- **UUIDs**: Generated as strings using UUID() function
- **Arrays**: `technologies` and `features` arrays converted to JSON
- **Auth Users**: Creates custom users table (no Supabase auth dependency)
- **Settings**: `key` column renamed to `setting_key` (MySQL reserved word)
- **Foreign Keys**: Proper MySQL foreign key constraints added

## ⚠️ Important Notes

### Authentication
- The script creates a basic user account for the portfolio owner
- Supabase auth users may not be fully accessible with anon key
- Consider using `SUPABASE_SERVICE_ROLE_KEY` for complete access

### Data Safety
- Migration runs in a MySQL transaction (auto-rollback on error)
- Uses `INSERT ... ON DUPLICATE KEY UPDATE` to prevent duplicate errors
- Existing data is preserved and updated where conflicts occur

### File Storage
- Only database records are migrated, not actual files
- Update your file storage solution (switch from Supabase Storage to AWS S3, etc.)
- Update file URLs in the migrated data if needed

## 🐛 Troubleshooting

### Common Issues:

**Connection Refused (MySQL)**
```bash
ERROR: ECONNREFUSED 127.0.0.1:3306
```
- Ensure MySQL server is running
- Check host/port configuration
- Verify firewall settings

**Access Denied (MySQL)**
```bash
ERROR: ER_ACCESS_DENIED_ERROR
```
- Verify username and password
- Ensure user has sufficient privileges
- Grant permissions: `GRANT ALL PRIVILEGES ON portfolio_db.* TO 'user'@'localhost';`

**Missing Tables (MySQL)**
```bash
ERROR: Table 'users' doesn't exist
```
- Run the schema script first: `mysql_database_schema.sql`
- Ensure you're connecting to the correct database

**Supabase RLS Errors**
```bash
ERROR: Row level security policy violation
```
- Try using `SUPABASE_SERVICE_ROLE_KEY` instead of anon key
- Check your RLS policies in Supabase dashboard

### Debug Steps:

1. **Check environment variables**
   ```bash
   node -e "require('dotenv').config(); console.log(process.env.MYSQL_HOST)"
   ```

2. **Test MySQL connection manually**
   ```bash
   mysql -h $MYSQL_HOST -u $MYSQL_USER -p $MYSQL_DATABASE
   ```

3. **Verify Supabase access**
   - Check project URL and API keys in Supabase dashboard
   - Test with `SUPABASE_SERVICE_ROLE_KEY` if available

4. **Check table structure**
   ```sql
   DESCRIBE users;
   SHOW CREATE TABLE projects;
   ```

## 🎯 Next Steps After Migration

1. **Verify Data**: Check migrated data in MySQL
2. **Update Application**: Modify your app to use MySQL instead of Supabase
3. **File Storage**: Set up new file storage solution (S3, Cloudinary, etc.)
4. **Authentication**: Implement custom auth system or use alternatives
5. **Test Thoroughly**: Ensure all functionality works with MySQL

## 🔗 Related Documentation

- [MySQL Database Schema](../mysql_database_schema.sql) - Complete database structure
- [Next.js Migration Guide](../docs/nextjs-migration.md) - Converting to Next.js
- [Environment Variables](../env.example) - Required configuration

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Verify your environment configuration
3. Test connections individually
4. Check MySQL and Supabase logs

---

**Happy migrating! 🚀** 
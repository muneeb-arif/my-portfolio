# 🚀 Automatic Update System - Setup Guide

Transform your manual cPanel upload process into **one-click automatic server-side updates**!

## 📋 Overview

This system enables **automatic server-side updates** where:
- ✅ **No manual cPanel uploads needed**
- ✅ **One-click updates from client websites**
- ✅ **Automatic download, extract, and apply**
- ✅ **Built-in backup and rollback**
- ✅ **Real-time progress tracking**

## 🏗️ How It Works

### **Traditional Manual Process:**
```
1. You create build.zip
2. Send to client via email
3. Client downloads ZIP
4. Client logs into cPanel
5. Client uploads via File Manager
6. Client extracts manually
7. No tracking or validation
```

### **New Automatic Process:**
```
1. You create update via dashboard
2. System notifies ALL clients instantly
3. Client clicks "Auto Update" on their site
4. Server automatically downloads ZIP
5. Server extracts and applies update
6. Automatic backup created
7. Real-time progress tracking
8. Page reloads with new version
```

## 🛠️ Setup Instructions

### 1. Database Setup

First, set up the database schema:

```sql
-- Run both schemas in your Supabase SQL editor
-- 1. Shared hosting schema (if not already done)
\i sql/shared-hosting-update-system.sql

-- 2. Automatic update schema
\i sql/automatic-update-system.sql
```

### 2. Upload PHP Endpoint

Upload the PHP endpoint to each client's shared hosting:

```bash
# Copy this file to each client's public_html directory
cp public/update-endpoint.php /path/to/client/public_html/
```

**Important:** Update the API key in each client's `update-endpoint.php`:
```php
define('UPDATE_API_KEY', 'your-unique-secure-api-key-here');
```

### 3. Security Configuration

Edit `public/update-endpoint.php` on each client server:

```php
// 1. Change the API key (line 12)
define('UPDATE_API_KEY', 'your-secure-random-key-123');

// 2. Add your update server domains (lines 16-22)
define('ALLOWED_DOMAINS', [
    'github.com',              // For GitHub Releases
    'amazonaws.com',           // For AWS S3
    'your-update-server.com',  // Your custom domain
    'dropbox.com',             // For Dropbox
    'drive.google.com'         // For Google Drive
]);
```

## 📁 File Structure

After setup, each client site should have:

```
public_html/
├── index.html              # Your portfolio site
├── update-endpoint.php     # Automatic update endpoint
├── backups/               # Auto-created backup directory
├── temp/                  # Auto-created temp directory
└── update.log            # Update activity log
```

## 🔧 Configuration Options

### API Key Security

Generate a secure API key for each client:

```bash
# Generate random API key
openssl rand -hex 32

# Or use online generator
# https://www.uuidgenerator.net/api/version4
```

### Server Limits

Adjust limits in `update-endpoint.php`:

```php
define('MAX_DOWNLOAD_SIZE', 50 * 1024 * 1024); // 50MB max
define('BACKUP_DIR', __DIR__ . '/backups/');
define('TEMP_DIR', __DIR__ . '/temp/');
```

### Allowed Domains

Only allow downloads from trusted sources:

```php
define('ALLOWED_DOMAINS', [
    'github.com',                    // GitHub Releases
    'your-cdn.com',                 // Your CDN
    'your-update-server.com'        // Your update server
]);
```

## 🧪 Testing the Setup

### 1. Test PHP Endpoint

Test if the endpoint is working:

```bash
# Test endpoint accessibility
curl -X POST https://client-site.com/update-endpoint.php \
  -H "Content-Type: application/json" \
  -d '{"api_key":"test"}'

# Should return JSON error about invalid API key
```

### 2. Test Automatic Detection

1. Visit the client's website
2. Check browser console for:
   ```
   🚀 Automatic updates supported
   ```
3. Check dashboard "🚀 Auto Capabilities" tab

### 3. Test Update Process

1. Create a test update in dashboard
2. Visit client website
3. Should see green "🚀 Auto Update" notification
4. Click "🚀 Auto Update"
5. Watch progress modal
6. Verify files updated

## 🔍 Troubleshooting

### Common Issues

#### ❌ "Automatic updates not supported"
**Causes:**
- PHP endpoint not uploaded
- Incorrect file permissions
- Wrong API key
- Server blocks external requests

**Solutions:**
```bash
# Check endpoint exists
curl -I https://client-site.com/update-endpoint.php

# Check file permissions
chmod 644 update-endpoint.php
chmod 755 backups/ temp/

# Check PHP error log
tail -f /path/to/php/error.log
```

#### ❌ "Failed to download update"
**Causes:**
- URL not in allowed domains
- Download size too large
- Network timeout
- Invalid download URL

**Solutions:**
```php
// Add domain to allowed list
define('ALLOWED_DOMAINS', [
    'your-new-domain.com'  // Add this
]);

// Increase size limit
define('MAX_DOWNLOAD_SIZE', 100 * 1024 * 1024); // 100MB

// Increase timeout
curl_setopt($ch, CURLOPT_TIMEOUT, 600); // 10 minutes
```

#### ❌ "Permission denied" errors
**Causes:**
- Insufficient file permissions
- SELinux restrictions
- Hosting limitations

**Solutions:**
```bash
# Set correct permissions
chmod 755 public_html/
chmod 755 public_html/backups/
chmod 755 public_html/temp/
chmod 644 update-endpoint.php

# Check directory ownership
chown -R username:username public_html/
```

### Debug Mode

Enable debug mode in `update-endpoint.php`:

```php
// Add at top of file
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');
```

## 📊 Monitoring & Analytics

### Dashboard Features

Access comprehensive analytics in your dashboard:

1. **📊 Overview Tab:**
   - Auto-capable vs manual-only clients
   - Success rates and performance metrics
   - Recent activity summary

2. **🚀 Auto Capabilities Tab:**
   - Which clients support automatic updates
   - Server information and capabilities
   - Last capability check timestamps

3. **📝 Recent Activity Tab:**
   - All update activities across clients
   - Execution times and success rates
   - Detailed error information

### Performance Metrics

Track key performance indicators:
- Average update execution time
- Success/failure rates
- Client adoption of automatic updates
- Download speeds and server performance

## 🔒 Security Best Practices

### 1. API Key Management
- Use unique API keys for each client
- Store keys securely
- Rotate keys periodically
- Never commit keys to version control

### 2. Domain Whitelisting
```php
// Only allow trusted domains
define('ALLOWED_DOMAINS', [
    'github.com',              // GitHub Releases
    'your-secure-cdn.com'      // Your CDN only
]);
```

### 3. File Validation
```php
// Validate file types
$allowedTypes = ['zip'];
$fileType = pathinfo($downloadUrl, PATHINFO_EXTENSION);
if (!in_array($fileType, $allowedTypes)) {
    throw new Exception('Invalid file type');
}
```

### 4. Backup Strategy
- Automatic backups before each update
- Keep last 5 backups per client
- Test backup restoration process
- Monitor backup storage usage

## 🚀 Advanced Features

### Custom Update Channels

Configure different update channels:

```javascript
// In your dashboard
const updateChannels = {
  stable: 'Production-ready updates',
  beta: 'Testing releases',
  alpha: 'Experimental features'
};
```

### Rollback Capability

Automatic rollback on failure:

```php
// Add to update-endpoint.php
function rollbackUpdate($backupPath) {
    // Extract backup and restore files
    // Log rollback activity
    // Notify dashboard
}
```

### Email Notifications

Notify clients of updates:

```javascript
// Integrate with your email service
const notifyClient = async (clientEmail, updateInfo) => {
    await emailService.send({
        to: clientEmail,
        subject: `Auto-update available: ${updateInfo.title}`,
        template: 'update-notification'
    });
};
```

## 📈 Scaling Considerations

### Server Resources
- Monitor CPU usage during updates
- Check available disk space
- Set reasonable download timeouts
- Implement rate limiting

### Client Management
- Track client capabilities
- Monitor update success rates
- Provide fallback to manual updates
- Regular capability health checks

### Storage Optimization
- Clean up old backups automatically
- Compress backup files
- Use CDN for update packages
- Monitor bandwidth usage

## 🎯 Migration Strategy

### Phase 1: Setup Infrastructure
1. ✅ Deploy database schemas
2. ✅ Upload PHP endpoints to all clients
3. ✅ Test automatic detection
4. ✅ Verify dashboard analytics

### Phase 2: Gradual Rollout
1. 🔄 Start with 1-2 test clients
2. 🔄 Create test updates
3. 🔄 Monitor success rates
4. 🔄 Fix any issues found

### Phase 3: Full Deployment
1. 📈 Roll out to all clients
2. 📈 Monitor performance metrics
3. 📈 Collect client feedback
4. 📈 Optimize based on data

## 📞 Support & Maintenance

### Regular Tasks
- Monitor update success rates
- Check server error logs
- Rotate API keys quarterly
- Update allowed domains list
- Clean up old backups

### Client Support
- Provide update instructions
- Monitor failed updates
- Offer manual fallback
- Maintain troubleshooting docs

### System Health
- Database performance monitoring
- Server resource usage
- Network connectivity checks
- Security audit quarterly

---

## 🎉 Success Metrics

After full deployment, you should see:

- ✅ **95%+ automatic update success rate**
- ✅ **Sub-30 second average update time**
- ✅ **Zero manual cPanel uploads needed**
- ✅ **Real-time visibility into all client updates**
- ✅ **Automatic backup and rollback capability**

---

**Need Help?** Check the troubleshooting section or contact support with:
- Client domain name
- Error messages from browser console
- PHP error logs from client server
- Screenshots of any issues

**System Status**: ✅ Production Ready  
**Last Updated**: [Current Date]  
**Version**: 1.0.0 
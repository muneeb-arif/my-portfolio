# 🏗️ Shared Hosting Update System

A comprehensive solution for distributing theme updates to multiple client deployments on shared hosting platforms (cPanel).

## 📋 Overview

This system is specifically designed for situations where:
- Clients use shared hosting (cPanel, Hostinger, Bluehost, etc.)
- Manual file upload via cPanel File Manager is required
- No automated deployment capabilities are available
- Multiple client sites need coordinated updates

## 🏗️ How It Works

### **For You (Theme Developer):**
1. **Create updates** through the dashboard or CLI
2. **Upload packages** to cloud storage (AWS S3, GitHub Releases, etc.)
3. **Push notifications** to all client sites
4. **Monitor progress** through analytics dashboard

### **For Your Clients:**
1. **Automatic notifications** appear on their websites
2. **Download update packages** with one click
3. **Follow guided instructions** for cPanel upload
4. **System tracks** successful updates

## 🛠️ Setup Instructions

### 1. Database Setup

Run the SQL schema to create necessary tables:

```bash
# Execute this in your Supabase SQL editor or via CLI
cat sql/shared-hosting-update-system.sql | supabase db reset --local
```

### 2. Client Site Integration

The shared hosting service automatically initializes on all public pages. No manual setup required on client sites.

### 3. Dashboard Access

Navigate to your dashboard and click on **"🏗️ Shared Hosting"** to access the management interface.

## 📦 Creating Updates

### Method 1: Dashboard Interface

1. Go to **Dashboard > Shared Hosting > Create Update**
2. Fill in the update details:
   - **Version**: Use semantic versioning (e.g., 1.2.0)
   - **Title**: Brief description of the update
   - **Package URL**: Direct download link to your ZIP file
   - **Release Notes**: Detailed changelog
   - **Special Instructions**: Any cPanel-specific steps

3. Click **"🚀 Create Update"**

### Method 2: CLI Tool

```bash
# Interactive update creation
npm run upload-package

# List recent updates
npm run list-updates

# List active clients
npm run list-clients
```

## 🌤️ Cloud Storage Options

### AWS S3 (Recommended)
```bash
1. Create S3 bucket
2. Upload your build.zip
3. Set public read permissions
4. Copy object URL
```

### GitHub Releases
```bash
1. Go to your repo > Releases
2. Create new release
3. Upload ZIP as asset
4. Copy download URL
```

### Google Drive
```bash
1. Upload to Google Drive
2. Share with "Anyone with link"
3. Modify URL format:
   From: drive.google.com/file/d/FILE_ID/view
   To: drive.google.com/uc?export=download&id=FILE_ID
```

## 👥 Client Workflow

### Automatic Process
1. **Client visits their site** → Notification appears
2. **Clicks "Download Update"** → ZIP file downloads
3. **Follows instructions** → Uploads to cPanel
4. **System detects update** → Marks as successful

### Manual Instructions for Clients
```
📋 Update Instructions:

1. 📥 Download the update package
2. 🔑 Login to your cPanel File Manager
3. 📁 Navigate to public_html folder
4. 💾 Backup current files (recommended)
5. 📤 Upload the ZIP file
6. 📦 Extract the ZIP file
7. ✅ Overwrite existing files
8. 🗑️ Delete the ZIP file
9. 🔍 Test your website
```

## 📊 Monitoring & Analytics

### Dashboard Features
- **Client Overview**: All registered deployments
- **Update Status**: Success rates and progress
- **Activity Logs**: Detailed tracking
- **Analytics**: Usage statistics

### Key Metrics
- Total active clients
- Update success rates
- Time to apply updates
- Client version distribution

## 🔧 Advanced Configuration

### Environment Variables
```env
REACT_APP_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### Update Channels
- **Stable**: Production-ready updates
- **Beta**: Testing versions
- **Alpha**: Experimental features

### Critical Updates
Mark important security updates as critical for priority notifications.

## 🐛 Troubleshooting

### Common Issues

#### "Update service failed to initialize"
- Check Supabase connection
- Verify database schema is applied
- Ensure RLS policies are correct

#### "No clients showing in dashboard"
- Clients appear when they visit their sites
- Check client sites are loading properly
- Verify shared hosting service is initialized

#### "Download URL not working"
- Test URL in browser incognito mode
- Ensure file is publicly accessible
- Check for correct direct download link

#### "Clients not receiving updates"
- Verify update is marked as "active"
- Check client version compatibility
- Ensure notifications were created

### Debug Commands
```bash
# Test database connection
npm run upload-package -- --help

# View client activity
npm run list-clients

# Check recent updates
npm run list-updates
```

## 📱 API Reference

### Client Registration
Automatic when clients visit their sites:
```javascript
await sharedHostingUpdateService.initialize();
```

### Check for Updates
```javascript
const result = await sharedHostingUpdateService.checkForUpdates();
```

### Log Activity
```javascript
await sharedHostingUpdateService.logUpdateActivity(updateId, 'download_attempted');
```

## 🔐 Security

### Row Level Security (RLS)
- Public read access for active updates
- Admin-only write access for updates
- Client-specific activity logging

### Data Protection
- No sensitive client data stored
- GDPR-compliant logging
- Automatic data cleanup

## 🚀 Best Practices

### For Theme Developers
1. **Test updates** on staging before release
2. **Use semantic versioning** consistently
3. **Provide clear instructions** for complex updates
4. **Monitor success rates** and follow up on failures
5. **Keep update packages small** for faster downloads

### For Update Creation
1. **Always backup** before creating updates
2. **Include rollback instructions** for critical updates
3. **Test download URLs** before publishing
4. **Use descriptive release notes**
5. **Set appropriate channel** (stable/beta/alpha)

### For Client Communication
1. **Send email notifications** for important updates
2. **Provide support contact** information
3. **Include video tutorials** for complex processes
4. **Follow up** on failed updates

## 📈 Scaling Considerations

### Performance
- Updates check every 24 hours (configurable)
- Lightweight notifications
- Efficient database queries

### Storage
- Use CDN for large update packages
- Implement automatic cleanup for old updates
- Consider bandwidth costs for clients

### Support
- Monitor update success rates
- Provide clear documentation
- Offer multiple support channels

## 🔄 Migration from Manual Process

### Current Process
```
1. Create build.zip
2. Send to clients via email
3. Clients manually upload to cPanel
4. No tracking or verification
```

### New Process
```
1. Create update via dashboard
2. System notifies all clients
3. Clients download and upload
4. Automatic tracking and analytics
```

## 📞 Support

### Getting Help
1. Check this documentation first
2. Review troubleshooting section
3. Check dashboard logs
4. Contact support with specific error messages

### Reporting Issues
Include:
- Error messages
- Client browser/environment
- Steps to reproduce
- Screenshot if applicable

---

## 🎯 Quick Start Checklist

- [ ] Run database schema setup
- [ ] Verify dashboard access
- [ ] Create test update
- [ ] Upload to cloud storage
- [ ] Test client notification
- [ ] Verify download process
- [ ] Monitor dashboard analytics

## 📧 Example Notification Email

```
Subject: Website Update Available - [Site Name]

Hi [Client Name],

A new update is available for your website:

🆕 Version: 1.2.0
📝 Title: Performance Improvements
🔧 Type: Bug fixes and optimizations

To apply this update:
1. Visit your website
2. Click the update notification
3. Download the package
4. Upload to your cPanel as instructed

Need help? Reply to this email or visit our support page.

Best regards,
[Your Name]
```

---

**System Status**: ✅ Production Ready  
**Last Updated**: [Current Date]  
**Version**: 1.0.0 
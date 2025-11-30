# Domain-Specific Supabase Configuration

This feature allows each domain to use its own Supabase project for storage, while keeping the default Supabase project for domains that don't have custom configuration.

## 🚀 Setup

### Step 1: Run Database Migration

Run the SQL migration to add Supabase columns to the domains table:

```bash
# Connect to your MySQL database and run:
mysql -u root -p portfolio < sql/add-supabase-to-domains.sql
```

Or manually execute the SQL in `sql/add-supabase-to-domains.sql`.

### Step 2: Configure Domain with Custom Supabase

To set a custom Supabase project for a specific domain (e.g., `nsfw.theexpertways.com`):

```sql
UPDATE domains 
SET supabase_url = 'https://your-new-project.supabase.co',
    supabase_anon_key = 'your-anon-key-here'
WHERE name LIKE '%nsfw.theexpertways.com%';
```

### Step 3: Verify Configuration

Check if the domain has custom Supabase config:

```sql
SELECT name, supabase_url, supabase_anon_key 
FROM domains 
WHERE name LIKE '%nsfw.theexpertways.com%';
```

## 📋 How It Works

1. **Default Behavior**: If a domain doesn't have `supabase_url` and `supabase_anon_key` set, it uses the default Supabase project from environment variables (`REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`).

2. **Custom Behavior**: If a domain has custom Supabase credentials in the database, it uses that Supabase project instead.

3. **Caching**: Supabase clients are cached per domain to improve performance.

## 🔧 API Endpoints

### Get Domain Supabase Config
```
GET /api/domains/config?domain=https://nsfw.theexpertways.com
```

Response:
```json
{
  "success": true,
  "supabase_url": "https://custom-project.supabase.co",
  "supabase_anon_key": "anon-key-here",
  "is_custom": true
}
```

## 📝 Usage Examples

### Frontend (React)
The `imageService` automatically uses domain-specific Supabase:

```javascript
import { imageService } from './services/imageService';

// This will use the correct Supabase based on current domain
await imageService.uploadImage(file);
await imageService.listUserImages();
```

### Backend (API)
The gallery endpoint automatically uses domain-specific Supabase:

```typescript
import { getSupabaseByDomain } from '@/lib/supabaseByDomain';

const domain = extractDomainFromOrigin(request.headers.get('origin'));
const supabase = await getSupabaseByDomain(domain);
```

## 🎯 Benefits

- **Storage Isolation**: Each domain can have its own Supabase storage bucket
- **Backward Compatible**: Existing domains continue using default Supabase
- **Easy Migration**: Just update the database, no code changes needed
- **Automatic**: The system automatically selects the correct Supabase project

## ⚠️ Important Notes

1. **User IDs**: Make sure user IDs are consistent across Supabase projects if you need to share data
2. **Bucket Names**: All Supabase projects should have the same bucket names (`images`, `avatars`, etc.)
3. **Environment Variables**: Keep the default Supabase credentials in `.env` for domains without custom config

## 🔍 Troubleshooting

### Domain not using custom Supabase?
- Check that `supabase_url` and `supabase_anon_key` are set in the database
- Verify the domain name matches exactly (including `http://` or `https://`)
- Check API logs for domain lookup errors

### Images not showing?
- Verify the custom Supabase project has the same bucket structure
- Check that user IDs match between projects
- Ensure the Supabase project has public read access for storage buckets


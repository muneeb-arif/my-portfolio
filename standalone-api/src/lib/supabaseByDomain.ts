import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { executeQuery } from '@/lib/database';
import { BUCKETS } from './supabase';

// Cache for Supabase clients (domain -> client)
const clientCache = new Map<string, SupabaseClient>();

// Get default Supabase client (from env vars)
let defaultSupabase: SupabaseClient | null = null;

function getDefaultSupabase(): SupabaseClient {
  if (defaultSupabase) {
    return defaultSupabase;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Default Supabase environment variables missing. Creating dummy client.');
    defaultSupabase = createClient('https://dummy.supabase.co', 'dummy-key');
    return defaultSupabase;
  }

  defaultSupabase = createClient(supabaseUrl, supabaseAnonKey);
  return defaultSupabase;
}

/**
 * Get Supabase client for a specific domain
 * If domain has custom Supabase config in database, use it
 * Otherwise, fall back to default Supabase from env vars
 */
export async function getSupabaseByDomain(domain: string): Promise<SupabaseClient> {
  if (!domain) {
    return getDefaultSupabase();
  }

  // Check cache first
  if (clientCache.has(domain)) {
    return clientCache.get(domain)!;
  }

  try {
    // Query database for domain's Supabase config
    const query = `
      SELECT supabase_url, supabase_anon_key
      FROM domains
      WHERE name LIKE ?
      AND status = 1
      LIMIT 1
    `;

    const pattern = `%${domain}%`;
    const result = await executeQuery(query, [pattern]);

    if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
      const domainData = result.data[0] as any;

      // If domain has custom Supabase config (both URL and key are NOT NULL), use it
      if (domainData.supabase_url != null && 
          domainData.supabase_anon_key != null && 
          domainData.supabase_url.trim() !== '' && 
          domainData.supabase_anon_key.trim() !== '') {
        console.log(`✅ Using custom Supabase for domain: ${domain}`);
        const client = createClient(domainData.supabase_url, domainData.supabase_anon_key);
        clientCache.set(domain, client);
        return client;
      } else {
        console.log(`📦 Domain found but has NULL Supabase config, using default for: ${domain}`);
      }
    }
  } catch (error) {
    console.error('Error getting Supabase config for domain:', error);
  }

  // Fallback to default Supabase (from env vars)
  console.log(`📦 Using default Supabase for domain: ${domain}`);
  const defaultClient = getDefaultSupabase();
  clientCache.set(domain, defaultClient);
  return defaultClient;
}

/**
 * Extract domain from origin/referer header
 */
export function extractDomainFromOrigin(origin: string | null): string {
  if (!origin) return '';
  return origin.replace(/^https?:\/\//, '').split('/')[0];
}

export { BUCKETS };


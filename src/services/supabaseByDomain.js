import { createClient } from '@supabase/supabase-js';
import { BUCKETS } from '../config/supabase';
import { API_BASE } from '../utils/apiConfig';

// Cache for Supabase clients (domain -> client)
const clientCache = new Map();

// Get current domain
function getCurrentDomain() {
  return window.location.origin;
}

/**
 * Get Supabase client for current domain
 * If domain has custom Supabase config, use it
 * Otherwise, fall back to default Supabase from env vars
 */
export async function getSupabaseByDomain() {
  const domain = getCurrentDomain();
  
  // Check cache first
  if (clientCache.has(domain)) {
    return clientCache.get(domain);
  }
  
  try {
    // Fetch domain's Supabase config from API
    const response = await fetch(`${API_BASE}/domains/config?domain=${encodeURIComponent(domain)}`);
    const data = await response.json();
    
    if (data.success && data.is_custom && data.supabase_url && data.supabase_anon_key) {
      // Use domain-specific Supabase
      console.log('✅ Using custom Supabase for domain:', domain);
      const client = createClient(data.supabase_url, data.supabase_anon_key);
      clientCache.set(domain, client);
      return client;
    }
  } catch (error) {
    console.warn('Failed to get domain-specific Supabase, using default:', error);
  }
  
  // Fallback to default Supabase (from env vars)
  console.log('📦 Using default Supabase for domain:', domain);
  const { supabase } = require('../config/supabase');
  clientCache.set(domain, supabase);
  return supabase;
}

export { BUCKETS };


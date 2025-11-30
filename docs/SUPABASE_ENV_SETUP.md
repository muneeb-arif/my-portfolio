# Supabase Environment Variables Setup

## Default Supabase Configuration

These are the default Supabase credentials that will be used when domains have NULL values in the database:

- **URL**: `https://bpniquvjzwxjimeczjuf.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbmlxdXZqend4amltZWN6anVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NjY5NzgsImV4cCI6MjA2NTI0Mjk3OH0.b9zch2Wndt0yHGmeXPczfvHJeQxYobEL3CkrZRmHxFE`

## Environment Variables Required

### For Frontend (React App)
Add these to your root `.env` file:

```env
REACT_APP_SUPABASE_URL=https://bpniquvjzwxjimeczjuf.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbmlxdXZqend4amltZWN6anVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NjY5NzgsImV4cCI6MjA2NTI0Mjk3OH0.b9zch2Wndt0yHGmeXPczfvHJeQxYobEL3CkrZRmHxFE
```

### For API (Next.js Server)
Add these to your root `.env` file (same file, different variable names):

```env
SUPABASE_URL=https://bpniquvjzwxjimeczjuf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbmlxdXZqend4amltZWN6anVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NjY5NzgsImV4cCI6MjA2NTI0Mjk3OH0.b9zch2Wndt0yHGmeXPczfvHJeQxYobEL3CkrZRmHxFE
```

## Complete .env File Example

Your root `.env` file should include both sets:

```env
# Frontend Supabase (REACT_APP_ prefix)
REACT_APP_SUPABASE_URL=https://bpniquvjzwxjimeczjuf.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbmlxdXZqend4amltZWN6anVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NjY5NzgsImV4cCI6MjA2NTI0Mjk3OH0.b9zch2Wndt0yHGmeXPczfvHJeQxYobEL3CkrZRmHxFE

# API Supabase (no prefix - used as default when domains have NULL)
SUPABASE_URL=https://bpniquvjzwxjimeczjuf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbmlxdXZqend4amltZWN6anVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NjY5NzgsImV4cCI6MjA2NTI0Mjk3OH0.b9zch2Wndt0yHGmeXPczfvHJeQxYobEL3CkrZRmHxFE
```

## How It Works

1. **Frontend**: Uses `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` from `.env`
2. **API**: Uses `SUPABASE_URL` and `SUPABASE_ANON_KEY` from `.env` as the default
3. **Domain-Specific**: If a domain has custom Supabase config in the database, it uses that instead
4. **Fallback**: If domain has NULL values, API falls back to `SUPABASE_URL` and `SUPABASE_ANON_KEY`

## Verification

After setting up, verify the configuration:

1. **Frontend**: Check browser console - should see Supabase client initialized
2. **API**: Test endpoint `GET /api/supabase-test` - should return success
3. **Domain Config**: Test endpoint `GET /api/domains/config?domain=your-domain` - should return default or custom config

## Important Notes

- Both frontend and API can use the same `.env` file in the root directory
- Next.js automatically reads environment variables from `.env` files
- React requires the `REACT_APP_` prefix for security reasons
- API uses variables without prefix for server-side access
- These are the **default** values - domains with NULL in database will use these


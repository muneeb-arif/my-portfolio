/** True when the CRA build is missing API base URL (migration: Supabase env no longer required). */
export function checkEnvMissing() {
  return !process.env.REACT_APP_API_URL;
}

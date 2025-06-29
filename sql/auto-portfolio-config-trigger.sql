-- Auto-insert new users into portfolio_config table
-- This trigger ensures every new user is automatically configured for portfolio

-- Create trigger function
CREATE OR REPLACE FUNCTION auto_configure_portfolio()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new user into portfolio_config with active state
  INSERT INTO portfolio_config (owner_email, owner_user_id, is_active, created_at, updated_at)
  VALUES (
    NEW.email,
    NEW.id,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (owner_email) DO NOTHING; -- Don't overwrite existing config
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS auto_configure_portfolio_trigger ON auth.users;
CREATE TRIGGER auto_configure_portfolio_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_configure_portfolio();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION auto_configure_portfolio() TO authenticated, anon;

-- Test the trigger (optional - uncomment to test)
-- INSERT INTO auth.users (id, email, created_at, updated_at) 
-- VALUES (gen_random_uuid(), 'test@example.com', NOW(), NOW());
-- 
-- SELECT * FROM portfolio_config WHERE owner_email = 'test@example.com'; 
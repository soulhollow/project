/*
  # Clear Database
  
  1. Changes
    - Temporarily disable RLS policies
    - Drop existing data from tables in correct order
    - Re-enable RLS policies
    - Reset PostGIS extension
  
  2. Notes
    - Maintains table structure and policies
    - Safe cleanup that preserves referential integrity
*/

-- Disable RLS temporarily
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE ratings DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop triggers first
DROP TRIGGER IF EXISTS update_profile_rating_on_change ON ratings;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Drop functions
DROP FUNCTION IF EXISTS update_profile_rating();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Clear data from tables in correct order to maintain referential integrity
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE services CASCADE;
TRUNCATE TABLE ratings CASCADE;
TRUNCATE TABLE profiles CASCADE;

-- Clear auth.users table (this is safe as it cascades to profiles)
DELETE FROM auth.users;

-- Re-enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop and recreate PostGIS extension
DROP EXTENSION IF EXISTS postgis CASCADE;
CREATE EXTENSION IF NOT EXISTS postgis;
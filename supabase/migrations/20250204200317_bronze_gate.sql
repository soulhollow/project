/*
  # Clear Database

  1. Changes
    - Disable RLS temporarily for cleanup
    - Drop triggers and functions
    - Clear all data from tables
    - Re-enable RLS
    - Reset PostGIS extension
  
  2. Notes
    - Maintains referential integrity
    - Safe cleanup order
    - Preserves table structure
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
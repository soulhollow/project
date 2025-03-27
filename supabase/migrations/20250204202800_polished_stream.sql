/*
  # Fix city column and location handling

  1. Changes
    - Ensure city column exists
    - Add trigger for location updates
    - Add function to handle location updates with city
*/

-- Make sure PostGIS is enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Ensure city column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'city'
  ) THEN
    ALTER TABLE profiles ADD COLUMN city text;
  END IF;
END $$;

-- Create or replace the location update function to handle both coordinates and city
CREATE OR REPLACE FUNCTION update_profile_location(
  profile_id uuid,
  lat double precision,
  lon double precision
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate coordinates
  IF lat < -90 OR lat > 90 OR lon < -180 OR lon > 180 THEN
    RAISE EXCEPTION 'Invalid coordinates: latitude must be between -90 and 90, longitude between -180 and 180';
  END IF;

  -- Ensure user can only update their own profile
  IF profile_id != auth.uid() THEN
    RAISE EXCEPTION 'You can only update your own location';
  END IF;

  -- Update profile location
  UPDATE profiles
  SET 
    location = ST_SetSRID(ST_MakePoint(lon, lat), 4326),
    updated_at = now()
  WHERE id = profile_id
  AND id = auth.uid();
  
  RETURN FOUND;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and re-raise
    RAISE EXCEPTION 'Error updating location: %', SQLERRM;
END;
$$;

-- Revoke all existing permissions
REVOKE ALL ON FUNCTION update_profile_location FROM PUBLIC;
REVOKE ALL ON FUNCTION update_profile_location FROM authenticated;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_profile_location TO authenticated;

-- Create index for location-based queries if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE tablename = 'profiles' 
    AND indexname = 'profiles_location_idx'
  ) THEN
    CREATE INDEX profiles_location_idx ON profiles USING GIST (location);
  END IF;
END $$;
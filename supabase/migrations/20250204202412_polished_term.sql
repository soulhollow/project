/*
  # Fix Location Function and Permissions

  1. Changes
    - Recreate location update function with proper error handling
    - Add proper permissions
  
  2. Security
    - Function is security definer
    - Only authenticated users can execute
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_profile_location;

-- Recreate function with better error handling
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
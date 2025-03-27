/*
  # Add Location Update Function

  1. New Functions
    - update_profile_location: Securely update a profile's location coordinates
  
  2. Security
    - Function uses SECURITY DEFINER to run with elevated privileges
    - Checks auth.uid() to ensure users can only update their own location
    - Execute permission granted to authenticated users only
*/

-- Function to update profile location
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
  -- Update profile location
  UPDATE profiles
  SET location = ST_SetSRID(ST_MakePoint(lon, lat), 4326)
  WHERE id = profile_id
  AND id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_profile_location TO authenticated;
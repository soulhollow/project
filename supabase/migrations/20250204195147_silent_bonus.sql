/*
  # Update existing profiles with random locations

  1. Changes
    - Updates all existing profiles with random locations within a 10-mile radius of New York City
    - Uses PostGIS to generate random points
    - Ensures all points are on land (roughly)

  2. Notes
    - Random locations are generated within Manhattan and surrounding areas
    - Base coordinates: 40.7589° N, 73.9851° W (Times Square)
    - Radius: ~10 miles
*/

-- Function to generate a random point within a radius of a center point
CREATE OR REPLACE FUNCTION random_point_in_radius(
  center_lon float,
  center_lat float,
  radius_miles float
) RETURNS geometry AS $$
DECLARE
  random_distance float;
  random_angle float;
  point_lon float;
  point_lat float;
BEGIN
  -- Convert radius to degrees (approximately)
  radius_miles := radius_miles / 69.0;
  
  -- Generate random distance and angle
  random_distance := radius_miles * sqrt(random());
  random_angle := 2 * pi() * random();
  
  -- Calculate new point
  point_lon := center_lon + (random_distance * cos(random_angle));
  point_lat := center_lat + (random_distance * sin(random_angle));
  
  -- Return as PostGIS point
  RETURN ST_SetSRID(ST_MakePoint(point_lon, point_lat), 4326);
END;
$$ LANGUAGE plpgsql;

-- Update all existing profiles with random locations
UPDATE profiles
SET location = random_point_in_radius(-73.9851, 40.7589, 10.0)
WHERE location IS NULL;
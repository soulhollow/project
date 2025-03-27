/*
  # Add Location Column to Profiles Table

  1. Changes
    - Add PostGIS location column to profiles table
  
  2. Security
    - Maintains existing RLS policies
*/

-- Enable PostGIS if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add location column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS profiles_location_idx 
ON profiles USING GIST (location);
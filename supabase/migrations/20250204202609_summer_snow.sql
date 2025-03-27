/*
  # Add city column to profiles table

  1. Changes
    - Add city column to store the city name
    - Update existing profiles to have null city
  
  2. Changes
    - Add city column to profiles table
*/

-- Add city column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS city text;
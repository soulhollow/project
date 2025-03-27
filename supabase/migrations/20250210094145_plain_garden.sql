/*
  # Add AGB acceptance tracking

  1. Changes
    - Add `agb_accepted` column to profiles table with default false
    - Update existing profiles to have agb_accepted = false
*/

-- Add agb_accepted column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'agb_accepted'
  ) THEN
    ALTER TABLE profiles ADD COLUMN agb_accepted boolean DEFAULT false;
  END IF;
END $$;
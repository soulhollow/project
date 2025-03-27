/*
  # Update RLS policies for profiles

  1. Changes
    - Add policy to allow users to insert their own profile
    - Add policy to allow users to update their own profile
    - Add policy to allow public read access to profiles

  2. Security
    - Users can only create/update their own profile
    - Everyone can read profiles
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new policies
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
/*
  # Add favorites functionality
  
  1. New Tables
    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `freelancer_id` (uuid, references profiles)
      - `created_at` (timestamptz)
  
  2. Constraints
    - Unique constraint on (user_id, freelancer_id)
    - Check constraint to prevent self-favoriting
  
  3. Security
    - Enable RLS
    - Add policies for viewing, adding, and removing favorites
*/

-- Drop existing table and policies if they exist
DROP TABLE IF EXISTS favorites CASCADE;

-- Create favorites table
CREATE TABLE favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  freelancer_id uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  -- Ensure users can only favorite once
  UNIQUE(user_id, freelancer_id),
  -- Prevent self-favoriting
  CONSTRAINT no_self_favorite CHECK (user_id != freelancer_id)
);

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
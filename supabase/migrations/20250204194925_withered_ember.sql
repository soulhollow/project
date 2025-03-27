/*
  # Add ratings functionality

  1. New Tables
    - `ratings`
      - `id` (uuid, primary key)
      - `freelancer_id` (uuid, references profiles)
      - `rater_id` (uuid, references profiles)
      - `rating` (integer, 1-5)
      - `comment` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `ratings` table
    - Add policies for:
      - Anyone can view ratings
      - Authenticated users can create ratings
      - Users can only rate once per freelancer
      - Users cannot rate themselves

  3. Functions
    - Add trigger to update average rating in profiles table
*/

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id uuid REFERENCES profiles(id) NOT NULL,
  rater_id uuid REFERENCES profiles(id) NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  -- Ensure users can only rate once per freelancer
  UNIQUE(freelancer_id, rater_id),
  -- Prevent self-rating
  CONSTRAINT no_self_rating CHECK (freelancer_id != rater_id)
);

-- Enable RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Ratings are viewable by everyone"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create ratings"
  ON ratings FOR INSERT
  WITH CHECK (auth.uid() = rater_id);

-- Create function to update average rating
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET rating = (
    SELECT ROUND(AVG(rating)::numeric, 1)
    FROM ratings
    WHERE freelancer_id = NEW.freelancer_id
  )
  WHERE id = NEW.freelancer_id;
  RETURN NEW;
END;
$$ language plpgsql;

-- Create trigger to update rating on insert or delete
CREATE TRIGGER update_profile_rating_on_change
  AFTER INSERT OR DELETE OR UPDATE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_rating();
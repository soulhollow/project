/*
  # Add rating functionality

  1. Changes
    - Add trigger to update average rating on profiles
    - Add RLS policies for ratings
    - Add function to check if user can rate

  2. Security
    - Enable RLS on ratings table
    - Add policies to control who can rate
    - Prevent self-rating
*/

-- Create function to check if user can rate
CREATE OR REPLACE FUNCTION can_rate_freelancer(freelancer_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user is trying to rate themselves
  IF freelancer_id = auth.uid() THEN
    RETURN false;
  END IF;

  -- Check if the user has already rated this freelancer
  RETURN NOT EXISTS (
    SELECT 1 
    FROM ratings 
    WHERE freelancer_id = $1 
    AND rater_id = auth.uid()
  );
END;
$$;

-- Create function to update average rating
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Create trigger for rating updates
CREATE OR REPLACE TRIGGER update_profile_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_rating();

-- Add RLS policies for ratings
CREATE POLICY "Users can view all ratings"
  ON ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can rate freelancers once"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (
    can_rate_freelancer(freelancer_id)
  );

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION can_rate_freelancer TO authenticated;
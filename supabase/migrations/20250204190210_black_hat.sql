/*
  # Add profile creation trigger

  1. New Function
    - Create function to automatically create a profile when a user signs up
  
  2. New Trigger
    - Add trigger to auth.users table to call the function on insert
*/

-- Create the function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, bio, interests, is_freelancer, rating, availability)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    '',
    ARRAY[]::text[],
    false,
    0.0,
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
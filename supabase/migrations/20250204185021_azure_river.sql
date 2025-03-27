/*
  # Initial Schema for Freelancer Portal

  1. New Tables
    - `profiles`
      - Stores user profile information
      - Links to Supabase auth.users
      - Includes location data and interests
    
    - `messages`
      - Stores chat messages between users
      - Includes sender, receiver, and message content
    
    - `services`
      - Stores services offered by freelancers
      - Links to profiles

  2. Security
    - Enable RLS on all tables
    - Add policies for secure data access
*/

-- Enable PostGIS extension for location-based queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text NOT NULL,
  bio text,
  interests text[],
  location geometry(Point, 4326),
  is_freelancer boolean DEFAULT false,
  rating numeric(2,1) DEFAULT 0.0,
  availability boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  rate numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id) NOT NULL,
  receiver_id uuid REFERENCES profiles(id) NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Services policies
CREATE POLICY "Services are viewable by everyone"
  ON services FOR SELECT
  USING (true);

CREATE POLICY "Freelancers can insert their services"
  ON services FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Freelancers can update their services"
  ON services FOR UPDATE
  USING (auth.uid() = profile_id);

-- Messages policies
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
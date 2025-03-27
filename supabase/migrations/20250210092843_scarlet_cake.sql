-- Create booking_slots table
CREATE TABLE IF NOT EXISTS booking_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id uuid REFERENCES profiles(id) NOT NULL,
  client_id uuid REFERENCES profiles(id),
  service_id uuid REFERENCES services(id),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Enable RLS
ALTER TABLE booking_slots ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Booking slots are viewable by everyone"
  ON booking_slots FOR SELECT
  USING (true);

CREATE POLICY "Freelancers can create slots"
  ON booking_slots FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Clients can book available slots"
  ON booking_slots FOR UPDATE
  TO authenticated
  USING (
    is_available = true AND
    EXISTS (
      SELECT 1
      FROM booking_slots
      WHERE id = booking_slots.id
      AND is_available = true
    )
  )
  WITH CHECK (
    is_available = false AND
    auth.uid() = client_id
  );

CREATE POLICY "Freelancers can manage their slots"
  ON booking_slots FOR UPDATE
  TO authenticated
  USING (auth.uid() = freelancer_id);

-- Create index for faster queries
CREATE INDEX booking_slots_freelancer_id_idx ON booking_slots (freelancer_id);
CREATE INDEX booking_slots_client_id_idx ON booking_slots (client_id);
CREATE INDEX booking_slots_time_range_idx ON booking_slots (start_time, end_time);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_booking_slots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_booking_slots_updated_at
  BEFORE UPDATE ON booking_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_slots_updated_at();
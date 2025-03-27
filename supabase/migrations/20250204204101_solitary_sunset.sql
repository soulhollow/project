-- Insert users and profiles for Stuttgart-based freelancers
INSERT INTO auth.users (id, email)
VALUES
  ('f6c61c3f-c6b8-4c33-b29d-c892a5c36666', 'lukas.mueller@example.com'),
  ('f7c61c3f-c6b8-4c33-b29d-c892a5c36777', 'anna.schmidt@example.com'),
  ('f8c61c3f-c6b8-4c33-b29d-c892a5c36888', 'thomas.wagner@example.com')
ON CONFLICT (id) DO NOTHING;

-- Insert profiles for the new users
INSERT INTO profiles (
  id,
  name,
  bio,
  interests,
  location,
  is_freelancer,
  rating,
  availability,
  city
)
VALUES
  (
    'f6c61c3f-c6b8-4c33-b29d-c892a5c36666',
    'Lukas Müller',
    'Full-stack developer specializing in React and Node.js. Based in Stuttgart with experience in automotive industry software.',
    ARRAY['web development', 'react', 'node.js', 'typescript'],
    ST_SetSRID(ST_MakePoint(9.1829, 48.7758), 4326),
    true,
    4.9,
    true,
    'Stuttgart'
  ),
  (
    'f7c61c3f-c6b8-4c33-b29d-c892a5c36777',
    'Anna Schmidt',
    'UI/UX designer with expertise in automotive interfaces and digital products. Creating user-centered designs for Stuttgart''s tech community.',
    ARRAY['ui design', 'automotive ui', 'figma', 'user research'],
    ST_SetSRID(ST_MakePoint(9.1829, 48.7758), 4326),
    true,
    4.8,
    true,
    'Stuttgart'
  ),
  (
    'f8c61c3f-c6b8-4c33-b29d-c892a5c36888',
    'Thomas Wagner',
    'DevOps engineer with extensive experience in cloud infrastructure and CI/CD pipelines. Supporting Stuttgart''s tech ecosystem.',
    ARRAY['devops', 'aws', 'kubernetes', 'docker'],
    ST_SetSRID(ST_MakePoint(9.1829, 48.7758), 4326),
    true,
    4.7,
    true,
    'Stuttgart'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert services for Stuttgart-based freelancers
INSERT INTO services (profile_id, title, description, rate)
VALUES
  -- Lukas Müller's services
  ('f6c61c3f-c6b8-4c33-b29d-c892a5c36666', 'Full-Stack Development', 'End-to-end web application development with React and Node.js', 95.00),
  ('f6c61c3f-c6b8-4c33-b29d-c892a5c36666', 'Automotive Software Development', 'Custom software solutions for automotive industry', 110.00),
  ('f6c61c3f-c6b8-4c33-b29d-c892a5c36666', 'Technical Consulting', 'Expert advice on software architecture and best practices', 120.00),

  -- Anna Schmidt's services
  ('f7c61c3f-c6b8-4c33-b29d-c892a5c36777', 'UI/UX Design', 'User interface design for web and mobile applications', 90.00),
  ('f7c61c3f-c6b8-4c33-b29d-c892a5c36777', 'Automotive UI Design', 'Specialized interface design for automotive displays', 115.00),
  ('f7c61c3f-c6b8-4c33-b29d-c892a5c36777', 'User Research', 'Comprehensive user research and usability testing', 85.00),

  -- Thomas Wagner's services
  ('f8c61c3f-c6b8-4c33-b29d-c892a5c36888', 'DevOps Implementation', 'Setting up and optimizing CI/CD pipelines', 105.00),
  ('f8c61c3f-c6b8-4c33-b29d-c892a5c36888', 'Cloud Architecture', 'AWS and Kubernetes infrastructure design', 120.00),
  ('f8c61c3f-c6b8-4c33-b29d-c892a5c36888', 'Infrastructure Monitoring', 'Setting up comprehensive monitoring solutions', 95.00)
ON CONFLICT DO NOTHING;

-- Insert initial ratings
INSERT INTO ratings (freelancer_id, rater_id, rating, comment)
VALUES
  -- Ratings for Lukas Müller
  ('f6c61c3f-c6b8-4c33-b29d-c892a5c36666', 'f7c61c3f-c6b8-4c33-b29d-c892a5c36777', 5, 'Excellent developer with deep technical knowledge. Delivered our project on time and with high quality.'),
  ('f6c61c3f-c6b8-4c33-b29d-c892a5c36666', 'f8c61c3f-c6b8-4c33-b29d-c892a5c36888', 5, 'Great experience working with Lukas. Very professional and skilled developer.'),

  -- Ratings for Anna Schmidt
  ('f7c61c3f-c6b8-4c33-b29d-c892a5c36777', 'f6c61c3f-c6b8-4c33-b29d-c892a5c36666', 5, 'Anna''s designs are innovative and user-friendly. She has a great understanding of automotive UI requirements.'),
  ('f7c61c3f-c6b8-4c33-b29d-c892a5c36777', 'f8c61c3f-c6b8-4c33-b29d-c892a5c36888', 4, 'Professional designer with strong attention to detail.'),

  -- Ratings for Thomas Wagner
  ('f8c61c3f-c6b8-4c33-b29d-c892a5c36888', 'f6c61c3f-c6b8-4c33-b29d-c892a5c36666', 5, 'Thomas helped us modernize our infrastructure. Excellent DevOps expertise.'),
  ('f8c61c3f-c6b8-4c33-b29d-c892a5c36888', 'f7c61c3f-c6b8-4c33-b29d-c892a5c36777', 4, 'Very knowledgeable in cloud infrastructure and always available for support.')
ON CONFLICT DO NOTHING;
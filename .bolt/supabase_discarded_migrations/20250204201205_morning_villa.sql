/*
  # Add Test Freelancer Data

  1. New Data
    - 5 freelancer profiles with diverse skills and services
    - Services for each freelancer
    - Initial ratings and reviews
  
  2. Changes
    - Adds test data for the freelancer marketplace
    - Creates realistic service offerings
    - Adds initial ratings to establish reputation
*/

-- Insert new users and their profiles
DO $$ 
DECLARE
  user_id uuid;
  user_data RECORD;
BEGIN
  -- Define user data
  FOR user_data IN (
    SELECT * FROM (VALUES
      (
        'f1c61c3f-c6b8-4c33-b29d-c892a5c36111',
        'rachel.zhang@example.com',
        'Rachel Zhang',
        'UI/UX designer specializing in mobile app interfaces. Creating intuitive and delightful user experiences through research-driven design.',
        ARRAY['ui design', 'mobile design', 'user research']::text[],
        4.8
      ),
      (
        'f2c61c3f-c6b8-4c33-b29d-c892a5c36222',
        'marcus.johnson@example.com',
        'Marcus Johnson',
        'Digital marketing consultant with expertise in PPC and social media advertising. Helping businesses reach their target audience effectively.',
        ARRAY['digital marketing', 'ppc', 'social media ads']::text[],
        4.7
      ),
      (
        'f3c61c3f-c6b8-4c33-b29d-c892a5c36333',
        'isabella.garcia@example.com',
        'Isabella Garcia',
        'Professional photographer specializing in product and brand photography. Creating stunning visuals that tell your brand''s story.',
        ARRAY['photography', 'product photography', 'brand photography']::text[],
        4.9
      ),
      (
        'f4c61c3f-c6b8-4c33-b29d-c892a5c36444',
        'daniel.lee@example.com',
        'Daniel Lee',
        'Backend developer focused on scalable cloud solutions. Expert in AWS, Node.js, and microservices architecture.',
        ARRAY['backend', 'aws', 'node.js']::text[],
        4.8
      ),
      (
        'f5c61c3f-c6b8-4c33-b29d-c892a5c36555',
        'sophia.patel@example.com',
        'Sophia Patel',
        'Animation artist and illustrator creating custom animations for websites and apps. Bringing ideas to life through motion.',
        ARRAY['animation', 'illustration', 'motion graphics']::text[],
        4.9
      )
    ) AS t(id, email, name, bio, interests, rating)
  ) LOOP
    -- Insert into auth.users if not exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_data.id::uuid) THEN
      INSERT INTO auth.users (id, email)
      VALUES (user_data.id::uuid, user_data.email);
      
      -- Insert into profiles
      INSERT INTO profiles (
        id,
        name,
        bio,
        interests,
        is_freelancer,
        rating,
        availability
      )
      VALUES (
        user_data.id::uuid,
        user_data.name,
        user_data.bio,
        user_data.interests,
        true,
        user_data.rating,
        true
      );
    END IF;
  END LOOP;
END $$;

-- Insert services
INSERT INTO services (profile_id, title, description, rate)
VALUES
  -- Rachel Zhang's services
  ('f1c61c3f-c6b8-4c33-b29d-c892a5c36111', 'Mobile App Design', 'Complete mobile app UI/UX design from wireframes to final assets', 95.00),
  ('f1c61c3f-c6b8-4c33-b29d-c892a5c36111', 'User Research', 'In-depth user research and usability testing', 85.00),
  ('f1c61c3f-c6b8-4c33-b29d-c892a5c36111', 'Design Systems', 'Creating comprehensive design systems and style guides', 90.00),

  -- Marcus Johnson's services
  ('f2c61c3f-c6b8-4c33-b29d-c892a5c36222', 'PPC Campaign Management', 'Google Ads and Facebook Ads campaign setup and optimization', 80.00),
  ('f2c61c3f-c6b8-4c33-b29d-c892a5c36222', 'Social Media Strategy', 'Comprehensive social media marketing strategy', 75.00),
  ('f2c61c3f-c6b8-4c33-b29d-c892a5c36222', 'Analytics & Reporting', 'Detailed marketing analytics and performance reporting', 70.00),

  -- Isabella Garcia's services
  ('f3c61c3f-c6b8-4c33-b29d-c892a5c36333', 'Product Photography', 'Professional product photography with styling', 120.00),
  ('f3c61c3f-c6b8-4c33-b29d-c892a5c36333', 'Brand Photography', 'Lifestyle and brand story photography', 150.00),
  ('f3c61c3f-c6b8-4c33-b29d-c892a5c36333', 'Photo Editing', 'Professional photo editing and retouching', 80.00),

  -- Daniel Lee's services
  ('f4c61c3f-c6b8-4c33-b29d-c892a5c36444', 'API Development', 'RESTful API design and development', 110.00),
  ('f4c61c3f-c6b8-4c33-b29d-c892a5c36444', 'Cloud Architecture', 'AWS cloud infrastructure design and implementation', 130.00),
  ('f4c61c3f-c6b8-4c33-b29d-c892a5c36444', 'Performance Optimization', 'Backend performance analysis and optimization', 120.00),

  -- Sophia Patel's services
  ('f5c61c3f-c6b8-4c33-b29d-c892a5c36555', 'Custom Animation', 'Custom animations for websites and applications', 95.00),
  ('f5c61c3f-c6b8-4c33-b29d-c892a5c36555', 'Character Design', 'Original character design and illustration', 85.00),
  ('f5c61c3f-c6b8-4c33-b29d-c892a5c36555', 'Motion Graphics', 'Motion graphics for digital content', 90.00)
ON CONFLICT DO NOTHING;

-- Insert initial ratings
INSERT INTO ratings (freelancer_id, rater_id, rating, comment)
VALUES
  -- Ratings for Rachel Zhang
  ('f1c61c3f-c6b8-4c33-b29d-c892a5c36111', 'f2c61c3f-c6b8-4c33-b29d-c892a5c36222', 5, 'Rachel''s mobile app designs are incredible. She has a great eye for detail and user experience.'),
  ('f1c61c3f-c6b8-4c33-b29d-c892a5c36111', 'f3c61c3f-c6b8-4c33-b29d-c892a5c36333', 5, 'Excellent work on our app redesign. The user research was thorough and insightful.'),

  -- Ratings for Marcus Johnson
  ('f2c61c3f-c6b8-4c33-b29d-c892a5c36222', 'f4c61c3f-c6b8-4c33-b29d-c892a5c36444', 5, 'Marcus significantly improved our ad performance. Great communication throughout the project.'),
  ('f2c61c3f-c6b8-4c33-b29d-c892a5c36222', 'f5c61c3f-c6b8-4c33-b29d-c892a5c36555', 4, 'Solid PPC campaign management with good results.'),

  -- Ratings for Isabella Garcia
  ('f3c61c3f-c6b8-4c33-b29d-c892a5c36333', 'f1c61c3f-c6b8-4c33-b29d-c892a5c36111', 5, 'Isabella''s product photos are stunning. She made our products look amazing.'),
  ('f3c61c3f-c6b8-4c33-b29d-c892a5c36333', 'f2c61c3f-c6b8-4c33-b29d-c892a5c36222', 5, 'Exceptional brand photography that perfectly captured our company culture.'),

  -- Ratings for Daniel Lee
  ('f4c61c3f-c6b8-4c33-b29d-c892a5c36444', 'f3c61c3f-c6b8-4c33-b29d-c892a5c36333', 5, 'Daniel built a robust and scalable API for our platform. Highly recommended.'),
  ('f4c61c3f-c6b8-4c33-b29d-c892a5c36444', 'f5c61c3f-c6b8-4c33-b29d-c892a5c36555', 4, 'Great work on optimizing our backend performance.'),

  -- Ratings for Sophia Patel
  ('f5c61c3f-c6b8-4c33-b29d-c892a5c36555', 'f1c61c3f-c6b8-4c33-b29d-c892a5c36111', 5, 'Sophia created beautiful animations that brought our website to life.'),
  ('f5c61c3f-c6b8-4c33-b29d-c892a5c36555', 'f2c61c3f-c6b8-4c33-b29d-c892a5c36222', 5, 'Outstanding motion graphics work. The animations perfectly matched our brand style.')
ON CONFLICT DO NOTHING;
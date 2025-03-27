/*
  # Add test data

  1. Test Data
    - Create auth.users entries for test accounts
    - Add 5 sample freelancer profiles with realistic data
    - Add services for each freelancer
    - Set locations in various places around a central point
*/

-- Create users in auth.users table first
INSERT INTO auth.users (id, email)
VALUES
  ('d1c61c3f-c6b8-4c33-b29d-c892a5c36111', 'sarah.chen@example.com'),
  ('d2c61c3f-c6b8-4c33-b29d-c892a5c36222', 'michael.rodriguez@example.com'),
  ('d3c61c3f-c6b8-4c33-b29d-c892a5c36333', 'emily.watson@example.com'),
  ('d4c61c3f-c6b8-4c33-b29d-c892a5c36444', 'david.kim@example.com'),
  ('d5c61c3f-c6b8-4c33-b29d-c892a5c36555', 'lisa.patel@example.com');

-- Insert test profiles
INSERT INTO profiles (id, name, bio, interests, location, is_freelancer, rating, availability)
VALUES
  ('d1c61c3f-c6b8-4c33-b29d-c892a5c36111', 'Sarah Chen', 'Full-stack developer with 5 years of experience specializing in React and Node.js. I love building scalable web applications and mentoring junior developers.', ARRAY['web development', 'react', 'nodejs'], ST_SetSRID(ST_MakePoint(-73.935242, 40.730610), 4326), true, 4.8, true),
  
  ('d2c61c3f-c6b8-4c33-b29d-c892a5c36222', 'Michael Rodriguez', 'UI/UX designer with a passion for creating beautiful and intuitive user interfaces. I combine design thinking with user research to deliver exceptional experiences.', ARRAY['ui design', 'ux research', 'figma'], ST_SetSRID(ST_MakePoint(-73.946242, 40.735610), 4326), true, 4.9, true),
  
  ('d3c61c3f-c6b8-4c33-b29d-c892a5c36333', 'Emily Watson', 'Digital marketing specialist focusing on SEO and content strategy. I help businesses increase their online visibility and drive organic traffic.', ARRAY['digital marketing', 'seo', 'content strategy'], ST_SetSRID(ST_MakePoint(-73.956242, 40.740610), 4326), true, 4.7, true),
  
  ('d4c61c3f-c6b8-4c33-b29d-c892a5c36444', 'David Kim', 'Mobile app developer specializing in React Native and iOS development. I''ve published multiple apps with millions of downloads.', ARRAY['mobile development', 'react native', 'ios'], ST_SetSRID(ST_MakePoint(-73.926242, 40.725610), 4326), true, 4.9, true),
  
  ('d5c61c3f-c6b8-4c33-b29d-c892a5c36555', 'Lisa Patel', 'DevOps engineer with expertise in AWS and containerization. I help teams implement CI/CD pipelines and improve deployment processes.', ARRAY['devops', 'aws', 'docker'], ST_SetSRID(ST_MakePoint(-73.916242, 40.720610), 4326), true, 4.8, true);

-- Insert services for Sarah Chen
INSERT INTO services (profile_id, title, description, rate)
VALUES
  ('d1c61c3f-c6b8-4c33-b29d-c892a5c36111', 'Full-Stack Development', 'End-to-end web application development using React, Node.js, and PostgreSQL', 95.00),
  ('d1c61c3f-c6b8-4c33-b29d-c892a5c36111', 'Code Review & Mentoring', 'Code review sessions and mentoring for junior developers', 75.00);

-- Insert services for Michael Rodriguez
INSERT INTO services (profile_id, title, description, rate)
VALUES
  ('d2c61c3f-c6b8-4c33-b29d-c892a5c36222', 'UI/UX Design', 'Complete user interface design including wireframes and prototypes', 85.00),
  ('d2c61c3f-c6b8-4c33-b29d-c892a5c36222', 'User Research', 'Comprehensive user research and usability testing', 90.00);

-- Insert services for Emily Watson
INSERT INTO services (profile_id, title, description, rate)
VALUES
  ('d3c61c3f-c6b8-4c33-b29d-c892a5c36333', 'SEO Optimization', 'Complete website SEO audit and optimization strategy', 80.00),
  ('d3c61c3f-c6b8-4c33-b29d-c892a5c36333', 'Content Strategy', 'Content calendar planning and optimization', 75.00);

-- Insert services for David Kim
INSERT INTO services (profile_id, title, description, rate)
VALUES
  ('d4c61c3f-c6b8-4c33-b29d-c892a5c36444', 'Mobile App Development', 'Native and cross-platform mobile app development', 100.00),
  ('d4c61c3f-c6b8-4c33-b29d-c892a5c36444', 'App Store Optimization', 'App store listing optimization and marketing', 85.00);

-- Insert services for Lisa Patel
INSERT INTO services (profile_id, title, description, rate)
VALUES
  ('d5c61c3f-c6b8-4c33-b29d-c892a5c36555', 'DevOps Consulting', 'CI/CD pipeline setup and optimization', 110.00),
  ('d5c61c3f-c6b8-4c33-b29d-c892a5c36555', 'Cloud Architecture', 'AWS infrastructure design and implementation', 120.00);
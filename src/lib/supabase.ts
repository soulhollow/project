import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'freelancer-portal@1.0.0'
    }
  }
});

// Test the connection
supabase.from('profiles').select('count').limit(1).single()
  .then(() => console.log('Successfully connected to Supabase'))
  .catch(error => {
    console.error('Error connecting to Supabase:', error.message);
    if (error.message.includes('Failed to fetch')) {
      console.error('Network error: Please check your internet connection and Supabase configuration');
    }
  });
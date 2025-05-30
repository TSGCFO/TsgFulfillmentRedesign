import { createClient } from '@supabase/supabase-js';

// Lazy initialization of Supabase client
let supabaseClient: any = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase environment variables not configured. Image management features will be disabled.');
      return null;
    }

    try {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      return null;
    }
  }
  return supabaseClient;
}

export const supabase = getSupabaseClient();

// Storage bucket name - you can change this to your preferred bucket name
export const IMAGE_BUCKET = 'images';
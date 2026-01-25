
import { createClient } from '@supabase/supabase-js';

// These should be defined in your .env file
const supabaseUrl = process.env.VITE_SUPABASE_URL; // Default for local docker
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);



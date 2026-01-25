
import { createClient } from '@supabase/supabase-js';

// These should be defined in your .env file
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321'; // Default for local docker
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

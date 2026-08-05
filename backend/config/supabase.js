import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SECRET_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('[Database] Supabase client initialized.');
} else {
  console.log('[Database] Supabase credentials missing or invalid. Using local fallback database store.');
}

export default supabase;

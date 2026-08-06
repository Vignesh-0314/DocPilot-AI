import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY;

let supabase = null;

const isValidUrl = Boolean(supabaseUrl && supabaseUrl.startsWith('http') && !supabaseUrl.includes('your_supabase'));
const isValidKey = Boolean(
  supabaseKey &&
  (supabaseKey.startsWith('eyJ') || supabaseKey.startsWith('sb_') || supabaseKey.length > 20) &&
  !supabaseKey.includes('your_supabase')
);

if (isValidUrl && isValidKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Database] Supabase client initialized successfully.');
  } catch (err) {
    console.error('[Database] Failed to initialize Supabase client:', err?.message || err);
  }
} else {
  console.log('[Database] Supabase credentials missing, placeholder, or invalid. Using local fallback database store.');
}

export default supabase;

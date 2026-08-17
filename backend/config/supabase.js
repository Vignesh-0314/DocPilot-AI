import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

const isValidUrl = Boolean(
  supabaseUrl &&
  typeof supabaseUrl === 'string' &&
  supabaseUrl.trim().startsWith('http') &&
  !supabaseUrl.includes('your_supabase')
);

const isValidKey = Boolean(
  supabaseKey &&
  typeof supabaseKey === 'string' &&
  (supabaseKey.startsWith('eyJ') || supabaseKey.startsWith('sb_') || supabaseKey.length > 20) &&
  !supabaseKey.includes('your_supabase')
);

if (isValidUrl && isValidKey) {
  try {
    supabase = createClient(supabaseUrl.trim(), supabaseKey.trim(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log('[Database] Supabase client initialized successfully as PRIMARY database.');
  } catch (err) {
    console.error('[Database] Failed to initialize Supabase client:', err?.message || err);
  }
} else {
  console.log('[Database] Supabase credentials missing or invalid. Using local fallback database store.');
}

export default supabase;

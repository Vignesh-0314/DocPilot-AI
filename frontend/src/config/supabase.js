import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://truairxifuovxhyvrqjs.supabase.co';
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_Qm7NUxZ63fMkqrdEtjh5tQ_nvDXof88';

export const supabase = createClient(supabaseUrl, supabaseKey);

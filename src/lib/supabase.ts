import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// This is a placeholder configuration.
// To use Supabase, the user will need to add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to a .env file.
export const supabase = createClient(supabaseUrl, supabaseKey);

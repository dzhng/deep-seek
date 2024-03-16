import { createClient } from '@supabase/supabase-js';

//import { Database } from '@/types/db';

const SupabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE ?? '';
const SupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

export default createClient</*Database*/ object>(
  SupabaseUrl,
  SupabaseServiceRole,
  {
    auth: {
      // set to all false for server side
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  },
);

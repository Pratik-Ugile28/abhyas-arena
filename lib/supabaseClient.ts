import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-ref.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-placeholder';

export const isSupabaseConfigured = (): boolean => {
  return (
    !!SUPABASE_URL &&
    !SUPABASE_URL.includes('your-project-ref') &&
    !!SUPABASE_ANON_KEY &&
    !SUPABASE_ANON_KEY.includes('your-anon-key-placeholder')
  );
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (clientInstance) return clientInstance;
  if (!isSupabaseConfigured()) return null;

  try {
    clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return clientInstance;
  } catch (err) {
    console.warn('[Supabase] Failed to initialize client:', err);
    return null;
  }
};

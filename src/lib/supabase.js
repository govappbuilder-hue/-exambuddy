import { createClient } from '@supabase/supabase-js';

// આ લાઈન ચેક કરશે કે બંનેમાંથી જે પણ નામ લોડ થયું હોય એને પકડી લે
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Supabase Credentials missing! Check your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
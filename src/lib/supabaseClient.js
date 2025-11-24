import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Build veya runtime’da env unutulursa daha erken patlasın
  console.error('Supabase env değişkenleri eksik. Lütfen VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY ayarlarını kontrol edin.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

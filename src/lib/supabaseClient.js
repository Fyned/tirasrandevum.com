import { createClient } from '@supabase/supabase-js';

// Supabase URL ve Anon Key doğrudan burada tanımlanmıştır.
const supabaseUrl = 'https://qtdieesowkpiioiflajf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZGllZXNvd2twaWlvaWZsYWpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNTU5MDMsImV4cCI6MjA3ODgzMTkwM30.Z2kReBCySltreAZYLYRZh-ZU8X-uvnPKNpfZz6BzEsg';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL veya Anon Key eksik. Lütfen .env dosyanızı veya supabaseClient.js dosyasını kontrol edin.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
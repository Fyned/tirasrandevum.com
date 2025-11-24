import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qtdieesowkpiioiflajf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZGllZXNvd2twaWlvaWZsYWpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNTU5MDMsImV4cCI6MjA3ODgzMTkwM30.Z2kReBCySltreAZYLYRZh-ZU8X-uvnPKNpfZz6BzEsg';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};

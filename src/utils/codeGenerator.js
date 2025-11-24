import { supabase } from '@/lib/supabaseClient';

/**
 * Generates a random alphanumeric code part.
 * @returns {string} A 4-character uppercase alphanumeric string.
 */
function generateCodePart() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let part = '';
  for (let i = 0; i < 4; i++) {
    part += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return part;
}

/**
 * Generates a unique barber code in the format "TR-XXXX-XXXX".
 * It checks the 'barbers' table in Supabase to ensure the code is unique.
 * Retries up to 10 times if a collision is found.
 * @returns {Promise<string>} A promise that resolves to a unique barber code.
 * @throws {Error} If a unique code cannot be generated after 10 attempts or if a Supabase error occurs.
 */
export async function generateUniqueBarberCode() {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = `TR-${generateCodePart()}-${generateCodePart()}`;
    
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('public_code')
        .eq('public_code', code)
        .maybeSingle(); // Use maybeSingle to avoid error if no row is found

      if (error) {
        // If it's any error other than "not found", throw it.
        // maybeSingle() should prevent PGRST116, but this is a safeguard.
        throw error;
      }
      
      // If data is null, the code is unique
      if (!data) {
        return code;
      }

    } catch (error) {
      console.error("Supabase error while checking code uniqueness:", error);
      throw new Error(`Veritabanı hatası: ${error.message}`);
    }

    attempts++;
    if (attempts >= maxAttempts) {
      throw new Error(`Benzersiz berber kodu ${maxAttempts} denemeden sonra üretilemedi. Lütfen tekrar deneyin.`);
    }
  }
}
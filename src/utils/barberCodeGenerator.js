/**
 * Generates a random 8-character code using uppercase letters and digits.
 * The format is TR-XXXX-YYYY.
 * e.g., TR-8FQ9-ZX3P
 * @returns {string} The generated code.
 */
export function generateUniqueBarberCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TR-${part1}-${part2}`;
}
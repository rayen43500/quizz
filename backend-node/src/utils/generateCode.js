const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateSessionCode(length = 6) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

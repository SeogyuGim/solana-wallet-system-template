import crypto from 'crypto';

export function encrypt(password: string) {
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('base64');
}
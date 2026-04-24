import { createHash } from 'node:crypto';

export function sha256Hash(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

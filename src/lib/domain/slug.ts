import { randomBytes } from 'node:crypto';

/**
 * Alphabet sans caractères ambigus (0/O, 1/l/I) : le lien est parfois recopié
 * à la main. 12 caractères ≈ 62 bits d'entropie, non énumérable.
 */
const ALPHABET = '23456789abcdefghijkmnpqrstuvwxyz';
const SLUG_LENGTH = 12;

export function generateSlug(): string {
  const bytes = randomBytes(SLUG_LENGTH);
  let slug = '';
  for (let i = 0; i < SLUG_LENGTH; i += 1) {
    slug += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return slug;
}

export function proposalUrl(siteUrl: string, slug: string): string {
  return `${siteUrl.replace(/\/$/, '')}/d/${slug}`;
}

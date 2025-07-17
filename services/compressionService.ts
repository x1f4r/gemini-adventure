import pako from 'pako';

/**
 * Compresses a JSON object into a compressed string.
 * @param {object} json The JSON object to compress.
 * @returns {string} The compressed string.
 */
export function compress(json: object): string {
  const jsonString = JSON.stringify(json);
  const compressed = pako.deflate(jsonString, { to: 'string' });
  return compressed;
}

/**
 * Decompresses a string into a JSON object.
 * @param {string} compressed The compressed string.
 * @returns {object} The decompressed JSON object.
 */
export function decompress(compressed: string): object {
  const decompressed = pako.inflate(compressed, { to: 'string' });
  return JSON.parse(decompressed);
}

import crypto from 'crypto';

export interface Shingle {
  hash: number;
  position: number;
  text: string;
}

export class ShingleGenerator {
  private windowSize: number;

  constructor(windowSize: number = 7) {
    this.windowSize = windowSize;
  }

  generate(text: string): Shingle[] {
    const words = text
      .toLowerCase()
      .replace(/[^\wа-яё\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(word => word.length > 0);

    const shingles: Shingle[] = [];

    for (let i = 0; i <= words.length - this.windowSize; i++) {
      const shingleWords = words.slice(i, i + this.windowSize);
      const shingleText = shingleWords.join(' ');
      const hash = this.hashString(shingleText);

      shingles.push({
        hash,
        position: i,
        text: shingleText
      });
    }

    return shingles;
  }

  private hashString(str: string): number {
    // Simple hash function (можно заменить на более сложный)
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  // MinHash для быстрого сравнения больших документов
  generateMinHash(shingles: Shingle[], numHashes: number = 100): number[] {
    const minHashes: number[] = [];

    for (let i = 0; i < numHashes; i++) {
      let minHash = Infinity;

      for (const shingle of shingles) {
        const hash = this.hashWithSeed(shingle.hash, i);
        if (hash < minHash) {
          minHash = hash;
        }
      }

      minHashes.push(minHash);
    }

    return minHashes;
  }

  private hashWithSeed(value: number, seed: number): number {
    const combined = value + seed;
    return Math.abs(combined * 2654435761) % (2 ** 32);
  }

  // Jaccard similarity для сравнения документов
  static calculateSimilarity(shingles1: number[], shingles2: number[]): number {
    const set1 = new Set(shingles1);
    const set2 = new Set(shingles2);

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }
}

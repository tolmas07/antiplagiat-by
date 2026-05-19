import { query } from '../config/database';

export interface Shingle {
  id: number;
  document_id: string;
  shingle_hash: number;
  position: number;
  text_fragment: string;
}

export class ShingleModel {
  static async createBatch(shingles: Omit<Shingle, 'id'>[]): Promise<void> {
    if (shingles.length === 0) return;

    const values = shingles.map((s, i) =>
      `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`
    ).join(',');

    const params = shingles.flatMap(s => [
      s.document_id,
      s.shingle_hash,
      s.position,
      s.text_fragment
    ]);

    await query(
      `INSERT INTO shingles (document_id, shingle_hash, position, text_fragment)
       VALUES ${values}`,
      params
    );
  }

  static async findMatches(hashes: number[], excludeDocId?: string): Promise<any[]> {
    let queryText = `
      SELECT
        s.document_id,
        s.text_fragment,
        COUNT(*) as match_count,
        d.original_filename,
        d.created_at
      FROM shingles s
      JOIN documents d ON s.document_id = d.id
      WHERE s.shingle_hash = ANY($1)
    `;

    const params: any[] = [hashes];

    if (excludeDocId) {
      queryText += ' AND s.document_id != $2';
      params.push(excludeDocId);
    }

    queryText += `
      GROUP BY s.document_id, s.text_fragment, d.original_filename, d.created_at
      HAVING COUNT(*) > 2
      ORDER BY match_count DESC
      LIMIT 100
    `;

    const result = await query(queryText, params);
    return result.rows;
  }

  static async deleteByDocumentId(documentId: string): Promise<void> {
    await query('DELETE FROM shingles WHERE document_id = $1', [documentId]);
  }
}

import { query } from '../config/database';

export interface Document {
  id: string;
  user_id?: string;
  filename: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  text_content: string;
  word_count: number;
  created_at: Date;
}

export class DocumentModel {
  static async create(doc: Omit<Document, 'id' | 'created_at'>): Promise<Document> {
    const result = await query(
      `INSERT INTO documents
       (user_id, filename, original_filename, file_size, file_type, text_content, word_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [doc.user_id, doc.filename, doc.original_filename, doc.file_size, doc.file_type, doc.text_content, doc.word_count]
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<Document | null> {
    const result = await query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByUserId(userId: string, limit: number = 10): Promise<Document[]> {
    const result = await query(
      'SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    return result.rows;
  }

  static async delete(id: string): Promise<void> {
    await query('DELETE FROM documents WHERE id = $1', [id]);
  }
}

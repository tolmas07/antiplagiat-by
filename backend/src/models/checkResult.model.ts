import { query } from '../config/database';

export interface CheckResult {
  id: string;
  document_id: string;
  user_id?: string;
  plagiarism_percent: number;
  ai_detection_percent: number;
  sources: any;
  status: string;
  created_at: Date;
  completed_at?: Date;
}

export interface Match {
  id: number;
  check_result_id: string;
  source_doc_id?: string;
  matched_text: string;
  match_percent: number;
  source_url?: string;
  created_at: Date;
}

export class CheckResultModel {
  static async create(
    documentId: string,
    userId?: string
  ): Promise<CheckResult> {
    const result = await query(
      `INSERT INTO check_results
       (document_id, user_id, plagiarism_percent, ai_detection_percent, sources, status)
       VALUES ($1, $2, 0, 0, '[]'::jsonb, 'processing')
       RETURNING *`,
      [documentId, userId]
    );
    return result.rows[0];
  }

  static async update(
    id: string,
    plagiarismPercent: number,
    aiPercent: number,
    sources: any
  ): Promise<void> {
    await query(
      `UPDATE check_results
       SET plagiarism_percent = $1,
           ai_detection_percent = $2,
           sources = $3,
           status = 'completed',
           completed_at = NOW()
       WHERE id = $4`,
      [plagiarismPercent, aiPercent, JSON.stringify(sources), id]
    );
  }

  static async findById(id: string): Promise<CheckResult | null> {
    const result = await query(
      'SELECT * FROM check_results WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByUserId(userId: string, limit: number = 20): Promise<CheckResult[]> {
    const result = await query(
      `SELECT cr.*, d.original_filename, d.word_count
       FROM check_results cr
       JOIN documents d ON cr.document_id = d.id
       WHERE cr.user_id = $1
       ORDER BY cr.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  static async createMatch(match: Omit<Match, 'id' | 'created_at'>): Promise<void> {
    await query(
      `INSERT INTO matches
       (check_result_id, source_doc_id, matched_text, match_percent, source_url)
       VALUES ($1, $2, $3, $4, $5)`,
      [match.check_result_id, match.source_doc_id, match.matched_text, match.match_percent, match.source_url]
    );
  }

  static async getMatches(checkResultId: string): Promise<Match[]> {
    const result = await query(
      'SELECT * FROM matches WHERE check_result_id = $1 ORDER BY match_percent DESC',
      [checkResultId]
    );
    return result.rows;
  }
}

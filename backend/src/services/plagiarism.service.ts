import { DocumentModel } from '../models/document.model';
import { ShingleModel } from '../models/shingle.model';
import { CheckResultModel } from '../models/checkResult.model';
import { ShingleGenerator } from '../utils/shingleGenerator';
import { AIDetector } from '../utils/aiDetector';
import { WebSearchService } from './webSearch.service';
import stringSimilarity from 'string-similarity';

export interface PlagiarismResult {
  plagiarismPercent: number;
  aiDetectionPercent: number;
  sources: PlagiarismSource[];
  details: any;
}

export interface PlagiarismSource {
  type: 'local' | 'web';
  documentId?: string;
  filename?: string;
  url?: string;
  matchPercent: number;
  matchedFragments: string[];
}

export class PlagiarismService {
  private shingleGenerator: ShingleGenerator;
  private webSearchService: WebSearchService;

  constructor() {
    this.shingleGenerator = new ShingleGenerator(7);
    this.webSearchService = new WebSearchService();
  }

  async checkDocument(documentId: string, userId?: string): Promise<string> {
    // Создаем запись о проверке
    const checkResult = await CheckResultModel.create(documentId, userId);

    // Запускаем проверку асинхронно
    this.performCheck(checkResult.id, documentId).catch(error => {
      console.error('Error during plagiarism check:', error);
    });

    return checkResult.id;
  }

  private async performCheck(checkResultId: string, documentId: string): Promise<void> {
    try {
      const document = await DocumentModel.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      const text = document.text_content;

      // 1. Генерируем shingles
      const shingles = this.shingleGenerator.generate(text);
      const shingleHashes = shingles.map(s => s.hash);

      // Сохраняем shingles в БД для будущих проверок
      await ShingleModel.createBatch(
        shingles.map(s => ({
          document_id: documentId,
          shingle_hash: s.hash,
          position: s.position,
          text_fragment: s.text
        }))
      );

      // 2. Проверка на плагиат в локальной БД
      const localMatches = await ShingleModel.findMatches(shingleHashes, documentId);
      const localSources = this.processLocalMatches(localMatches, text);

      // 3. Проверка на плагиат в интернете
      const searchFragments = WebSearchService.extractSearchFragments(text, 5);
      const webResults = await this.webSearchService.checkPlagiarismOnline(text, searchFragments);
      const webSources = this.processWebMatches(webResults);

      // 4. Детекция AI
      const aiResult = AIDetector.detect(text);
      const gptPatternScore = AIDetector.detectGPTPatterns(text);
      const aiDetectionPercent = Math.min((aiResult.score + gptPatternScore) / 2, 100);

      // 5. Подсчет общего процента плагиата
      const allSources = [...localSources, ...webSources];
      const plagiarismPercent = this.calculateTotalPlagiarism(allSources);

      // 6. Сохраняем результаты
      await CheckResultModel.update(
        checkResultId,
        plagiarismPercent,
        aiDetectionPercent,
        {
          sources: allSources,
          aiDetails: aiResult.details,
          totalMatches: allSources.length
        }
      );

      // 7. Сохраняем совпадения
      for (const source of allSources) {
        await CheckResultModel.createMatch({
          check_result_id: checkResultId,
          source_doc_id: source.documentId,
          matched_text: source.matchedFragments.join('\n'),
          match_percent: source.matchPercent,
          source_url: source.url
        });
      }

    } catch (error) {
      console.error('Plagiarism check error:', error);
      throw error;
    }
  }

  private processLocalMatches(matches: any[], originalText: string): PlagiarismSource[] {
    const sources: PlagiarismSource[] = [];
    const groupedByDoc = new Map<string, any[]>();

    // Группируем совпадения по документам
    for (const match of matches) {
      if (!groupedByDoc.has(match.document_id)) {
        groupedByDoc.set(match.document_id, []);
      }
      groupedByDoc.get(match.document_id)!.push(match);
    }

    // Обрабатываем каждый документ
    for (const [docId, docMatches] of groupedByDoc) {
      const matchedFragments = docMatches.map(m => m.text_fragment);
      const matchPercent = this.calculateMatchPercent(docMatches.length, originalText);

      if (matchPercent > 5) { // Порог 5%
        sources.push({
          type: 'local',
          documentId: docId,
          filename: docMatches[0].original_filename,
          matchPercent,
          matchedFragments: matchedFragments.slice(0, 10) // Ограничиваем количество
        });
      }
    }

    return sources.sort((a, b) => b.matchPercent - a.matchPercent);
  }

  private processWebMatches(webResults: any[]): PlagiarismSource[] {
    return webResults
      .filter(result => result.similarity > 0.3)
      .map(result => ({
        type: 'web' as const,
        url: result.url,
        matchPercent: Math.round(result.similarity * 100),
        matchedFragments: [result.snippet]
      }))
      .sort((a, b) => b.matchPercent - a.matchPercent)
      .slice(0, 10);
  }

  private calculateMatchPercent(matchCount: number, originalText: string): number {
    const totalShingles = this.shingleGenerator.generate(originalText).length;
    return Math.round((matchCount / totalShingles) * 100);
  }

  private calculateTotalPlagiarism(sources: PlagiarismSource[]): number {
    if (sources.length === 0) return 0;

    // Берем максимальный процент совпадения (консервативный подход)
    const maxMatch = Math.max(...sources.map(s => s.matchPercent));

    // Или можем использовать средневзвешенный
    // const avgMatch = sources.reduce((sum, s) => sum + s.matchPercent, 0) / sources.length;

    return Math.min(maxMatch, 100);
  }

  async getCheckResult(checkResultId: string): Promise<any> {
    const result = await CheckResultModel.findById(checkResultId);
    if (!result) {
      throw new Error('Check result not found');
    }

    const matches = await CheckResultModel.getMatches(checkResultId);

    return {
      ...result,
      matches
    };
  }
}

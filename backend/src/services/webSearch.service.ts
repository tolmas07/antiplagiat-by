import axios from 'axios';
import * as cheerio from 'cheerio';
import stringSimilarity from 'string-similarity';

export interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  similarity: number;
}

export class WebSearchService {
  private googleApiKey: string;
  private searchEngineId: string;

  constructor() {
    this.googleApiKey = process.env.GOOGLE_API_KEY || '';
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || '';
  }

  async searchGoogle(query: string, limit: number = 5): Promise<SearchResult[]> {
    if (!this.googleApiKey || !this.searchEngineId) {
      console.warn('Google API credentials not configured');
      return [];
    }

    try {
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: this.googleApiKey,
          cx: this.searchEngineId,
          q: query,
          num: limit
        }
      });

      const results: SearchResult[] = [];

      if (response.data.items) {
        for (const item of response.data.items) {
          results.push({
            url: item.link,
            title: item.title,
            snippet: item.snippet || '',
            similarity: 0
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Google search error:', error);
      return [];
    }
  }

  async searchYandex(query: string): Promise<SearchResult[]> {
    // Парсинг Яндекса (серая зона, может блокироваться)
    try {
      const response = await axios.get('https://yandex.ru/search/', {
        params: { text: query },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 5000
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      $('.serp-item').each((i, elem) => {
        if (i >= 5) return false; // Limit to 5 results

        const title = $(elem).find('.organic__title-wrapper').text().trim();
        const url = $(elem).find('.organic__url').text().trim();
        const snippet = $(elem).find('.organic__text').text().trim();

        if (url && title) {
          results.push({
            url: url.startsWith('http') ? url : `https://${url}`,
            title,
            snippet,
            similarity: 0
          });
        }
      });

      return results;
    } catch (error) {
      console.error('Yandex search error:', error);
      return [];
    }
  }

  async fetchPageContent(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000,
        maxContentLength: 1000000 // 1MB limit
      });

      const $ = cheerio.load(response.data);

      // Remove scripts, styles, and other non-content elements
      $('script, style, nav, header, footer, aside').remove();

      // Extract main content
      const content = $('body').text()
        .replace(/\s+/g, ' ')
        .trim();

      return content;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return '';
    }
  }

  async checkPlagiarismOnline(text: string, fragments: string[]): Promise<SearchResult[]> {
    const allResults: SearchResult[] = [];

    // Берем несколько уникальных фрагментов для поиска
    const searchFragments = fragments.slice(0, 3);

    for (const fragment of searchFragments) {
      // Пробуем Google
      const googleResults = await this.searchGoogle(fragment, 3);

      // Пробуем Яндекс (если Google не дал результатов)
      let yandexResults: SearchResult[] = [];
      if (googleResults.length === 0) {
        yandexResults = await this.searchYandex(fragment);
      }

      const results = [...googleResults, ...yandexResults];

      // Для каждого результата проверяем реальное содержимое страницы
      for (const result of results) {
        const pageContent = await this.fetchPageContent(result.url);

        if (pageContent) {
          const similarity = stringSimilarity.compareTwoStrings(
            text.toLowerCase(),
            pageContent.toLowerCase()
          );

          result.similarity = similarity;

          if (similarity > 0.3) { // Порог совпадения 30%
            allResults.push(result);
          }
        }

        // Задержка между запросами
        await this.delay(1000);
      }
    }

    // Сортируем по similarity и убираем дубликаты
    const uniqueResults = this.removeDuplicates(allResults);
    return uniqueResults.sort((a, b) => b.similarity - a.similarity).slice(0, 10);
  }

  private removeDuplicates(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    return results.filter(result => {
      if (seen.has(result.url)) {
        return false;
      }
      seen.add(result.url);
      return true;
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Извлечение уникальных фрагментов для поиска
  static extractSearchFragments(text: string, count: number = 5): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 50);
    const fragments: string[] = [];

    // Берем фрагменты из разных частей текста
    const step = Math.floor(sentences.length / count);

    for (let i = 0; i < count && i * step < sentences.length; i++) {
      const sentence = sentences[i * step].trim();
      if (sentence.length > 50 && sentence.length < 200) {
        fragments.push(sentence);
      }
    }

    return fragments;
  }
}

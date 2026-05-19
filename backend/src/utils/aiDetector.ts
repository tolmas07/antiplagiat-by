export class AIDetector {
  // Типичные фразы, используемые AI
  private static AI_PHRASES = [
    'в заключение можно сказать',
    'таким образом',
    'следует отметить',
    'важно подчеркнуть',
    'в современном мире',
    'в настоящее время',
    'необходимо отметить',
    'стоит отметить',
    'как показывает практика',
    'в данной работе',
    'целью данной работы является',
    'актуальность темы',
    'объектом исследования является',
    'предметом исследования является'
  ];

  static detect(text: string): { score: number; details: any } {
    let aiScore = 0;
    const details: any = {
      phraseMatches: [],
      structureScore: 0,
      diversityScore: 0,
      perplexityScore: 0,
      typoScore: 0
    };

    // 1. Проверка на типичные AI фразы
    const phraseScore = this.checkAIPhrases(text);
    details.phraseMatches = phraseScore.matches;
    aiScore += phraseScore.score;

    // 2. Анализ структуры
    const structureScore = this.analyzeStructure(text);
    details.structureScore = structureScore;
    aiScore += structureScore;

    // 3. Анализ разнообразия словаря
    const diversityScore = this.analyzeDiversity(text);
    details.diversityScore = diversityScore;
    aiScore += diversityScore;

    // 4. Анализ перплексии (предсказуемости)
    const perplexityScore = this.analyzePerplexity(text);
    details.perplexityScore = perplexityScore;
    aiScore += perplexityScore;

    // 5. Проверка на отсутствие опечаток (подозрительно для студента)
    const typoScore = this.checkTypos(text);
    details.typoScore = typoScore;
    aiScore += typoScore;

    return {
      score: Math.min(Math.max(aiScore, 0), 100),
      details
    };
  }

  private static checkAIPhrases(text: string): { score: number; matches: string[] } {
    const lowerText = text.toLowerCase();
    const matches: string[] = [];
    let score = 0;

    for (const phrase of this.AI_PHRASES) {
      if (lowerText.includes(phrase)) {
        matches.push(phrase);
        score += 5;
      }
    }

    return { score: Math.min(score, 30), matches };
  }

  private static analyzeStructure(text: string): number {
    let score = 0;

    // Проверка на наличие классической структуры
    const hasIntro = /введение|вступление/i.test(text);
    const hasConclusion = /заключение|вывод|итог/i.test(text);
    const hasChapters = /глава|раздел|параграф/i.test(text);

    if (hasIntro) score += 5;
    if (hasConclusion) score += 5;
    if (hasChapters) score += 5;

    // Проверка на слишком идеальную структуру
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;

    // AI часто генерирует предложения средней длины (15-25 слов)
    if (avgSentenceLength >= 15 && avgSentenceLength <= 25) {
      score += 10;
    }

    return Math.min(score, 25);
  }

  private static analyzeDiversity(text: string): number {
    const words = text.toLowerCase().match(/[а-яёa-z]+/gi) || [];
    const uniqueWords = new Set(words);

    const diversity = uniqueWords.size / words.length;

    // AI тексты часто имеют низкое разнообразие (0.3-0.5)
    // Человеческие тексты обычно 0.5-0.7
    if (diversity < 0.4) {
      return 20;
    } else if (diversity < 0.5) {
      return 10;
    }

    return 0;
  }

  private static analyzePerplexity(text: string): number {
    // Упрощенный анализ перплексии
    const words = text.toLowerCase().match(/[а-яёa-z]+/gi) || [];
    const bigrams = new Map<string, number>();

    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
    }

    // Подсчет повторяющихся биграмм
    const repeatedBigrams = Array.from(bigrams.values()).filter(count => count > 1).length;
    const bigramRepetitionRate = repeatedBigrams / bigrams.size;

    // AI тексты часто имеют высокую повторяемость паттернов
    if (bigramRepetitionRate > 0.3) {
      return 15;
    } else if (bigramRepetitionRate > 0.2) {
      return 10;
    }

    return 0;
  }

  private static checkTypos(text: string): number {
    const words = text.match(/[а-яёa-z]+/gi) || [];

    // Простая эвристика: проверка на повторяющиеся буквы (опечатки)
    let typoCount = 0;

    for (const word of words) {
      // Проверка на 3+ повторяющиеся буквы подряд (кроме некоторых исключений)
      if (/(.)\1{2,}/.test(word) && !['ооо', 'еее', 'ааа'].includes(word.toLowerCase())) {
        typoCount++;
      }
    }

    // Если текст длинный (>1000 слов) и опечаток меньше 2 - подозрительно
    if (words.length > 1000 && typoCount < 2) {
      return 10;
    }

    return 0;
  }

  // Дополнительный метод: проверка на характерные паттерны GPT
  static detectGPTPatterns(text: string): number {
    let score = 0;

    // GPT часто использует списки
    const listMatches = text.match(/^\s*[-•*]\s/gm);
    if (listMatches && listMatches.length > 5) {
      score += 10;
    }

    // GPT любит нумерованные списки
    const numberedLists = text.match(/^\s*\d+\.\s/gm);
    if (numberedLists && numberedLists.length > 5) {
      score += 10;
    }

    // GPT часто использует двоеточия перед списками
    const colonBeforeList = text.match(/:\s*\n\s*[-•*\d]/g);
    if (colonBeforeList && colonBeforeList.length > 3) {
      score += 5;
    }

    return Math.min(score, 25);
  }
}

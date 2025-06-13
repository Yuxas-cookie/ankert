import Sentiment from 'sentiment';
import { groupBy } from 'lodash';

export interface SentimentAnalysis {
  overall: {
    score: number;
    comparative: number;
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
  breakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  keywords: {
    positive: string[];
    negative: string[];
  };
  emotions?: {
    joy?: number;
    anger?: number;
    fear?: number;
    sadness?: number;
    surprise?: number;
    disgust?: number;
  };
}

export interface TextInsight {
  type: 'theme' | 'issue' | 'suggestion' | 'praise' | 'complaint';
  content: string;
  frequency: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  examples: string[];
  keywords: string[];
}

export interface WordCloudData {
  text: string;
  value: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface TopicAnalysis {
  topics: {
    id: string;
    name: string;
    keywords: string[];
    frequency: number;
    averageSentiment: number;
    examples: string[];
  }[];
  uncategorized: string[];
}

export interface LanguageMetrics {
  averageLength: number;
  readabilityScore: number;
  vocabularyDiversity: number;
  mostCommonWords: { word: string; count: number }[];
  languageComplexity: 'simple' | 'moderate' | 'complex';
}

export class TextAnalyzer {
  private sentiment: Sentiment;
  private stopWords!: Set<string>;
  private emotionKeywords!: { [emotion: string]: string[] };

  constructor() {
    this.sentiment = new Sentiment();
    this.initializeStopWords();
    this.initializeEmotionKeywords();
  }

  /**
   * Analyze sentiment of text responses
   */
  analyzeSentiment(texts: string[]): SentimentAnalysis {
    if (texts.length === 0) {
      return this.getEmptySentimentAnalysis();
    }

    const results = texts.map(text => {
      const cleaned = this.cleanText(text);
      return this.sentiment.analyze(cleaned);
    });

    // Calculate overall metrics
    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    const totalComparative = results.reduce((sum, result) => sum + result.comparative, 0);
    const overallScore = totalScore / results.length;
    const overallComparative = totalComparative / results.length;

    // Categorize sentiments
    let positive = 0, negative = 0, neutral = 0;
    results.forEach(result => {
      if (result.score > 1) positive++;
      else if (result.score < -1) negative++;
      else neutral++;
    });

    // Extract keywords
    const allPositiveWords = results.flatMap(r => r.positive);
    const allNegativeWords = results.flatMap(r => r.negative);
    
    const positiveKeywords = this.getTopWords(allPositiveWords, 10);
    const negativeKeywords = this.getTopWords(allNegativeWords, 10);

    // Determine overall label and confidence
    const label = this.determineSentimentLabel(overallScore);
    const confidence = this.calculateConfidence(overallScore, results.length);

    // Analyze emotions
    const emotions = this.analyzeEmotions(texts);

    return {
      overall: {
        score: overallScore,
        comparative: overallComparative,
        label,
        confidence
      },
      breakdown: {
        positive: (positive / results.length) * 100,
        negative: (negative / results.length) * 100,
        neutral: (neutral / results.length) * 100
      },
      keywords: {
        positive: positiveKeywords,
        negative: negativeKeywords
      },
      emotions
    };
  }

  /**
   * Extract key insights and themes from text responses
   */
  extractInsights(texts: string[], questionType?: string): TextInsight[] {
    if (texts.length === 0) return [];

    const insights: TextInsight[] = [];
    
    // Clean and tokenize texts
    const cleanedTexts = texts.map(text => this.cleanText(text));
    const allWords = cleanedTexts.flatMap(text => this.tokenize(text));
    
    // Find frequent phrases and themes
    const phrases = this.extractPhrases(cleanedTexts);
    const themes = this.identifyThemes(phrases);
    
    // Analyze each theme
    themes.forEach(theme => {
      const relatedTexts = cleanedTexts.filter(text => 
        theme.keywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()))
      );
      
      if (relatedTexts.length < 2) return; // Skip themes with too few examples
      
      const themeSentiment = this.analyzeSentiment(relatedTexts);
      const insightType = this.categorizeInsight(theme.name, themeSentiment.overall.label, questionType);
      
      insights.push({
        type: insightType,
        content: theme.name,
        frequency: relatedTexts.length,
        sentiment: themeSentiment.overall.label,
        examples: relatedTexts.slice(0, 3),
        keywords: theme.keywords
      });
    });

    // Sort by frequency and relevance
    return insights
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  /**
   * Generate word cloud data
   */
  generateWordCloudData(texts: string[], maxWords: number = 100): WordCloudData[] {
    if (texts.length === 0) return [];

    const cleanedTexts = texts.map(text => this.cleanText(text));
    const allWords = cleanedTexts.flatMap(text => this.tokenize(text));
    
    // Count word frequencies
    const wordCounts = this.countWords(allWords);
    
    // Filter out stop words and short words
    const filteredWords = Object.entries(wordCounts)
      .filter(([word]) => !this.stopWords.has(word.toLowerCase()) && word.length > 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, maxWords);

    // Analyze sentiment for each word
    return filteredWords.map(([word, count]) => {
      const wordSentiment = this.sentiment.analyze(word);
      let sentimentLabel: 'positive' | 'negative' | 'neutral' = 'neutral';
      
      if (wordSentiment.score > 0) sentimentLabel = 'positive';
      else if (wordSentiment.score < 0) sentimentLabel = 'negative';

      return {
        text: word,
        value: count,
        sentiment: sentimentLabel
      };
    });
  }

  /**
   * Perform topic modeling on text responses
   */
  analyzeTopics(texts: string[]): TopicAnalysis {
    if (texts.length === 0) {
      return { topics: [], uncategorized: [] };
    }

    const cleanedTexts = texts.map(text => this.cleanText(text));
    
    // Simple topic extraction based on keyword clustering
    const topicKeywords = {
      'User Experience': ['easy', 'difficult', 'intuitive', 'confusing', 'user-friendly', 'navigation', 'interface', 'design'],
      'Performance': ['fast', 'slow', 'speed', 'performance', 'loading', 'responsive', 'lag', 'quick'],
      'Features': ['feature', 'functionality', 'option', 'tool', 'capability', 'missing', 'need'],
      'Support': ['help', 'support', 'documentation', 'guide', 'assistance', 'customer service'],
      'Quality': ['quality', 'reliable', 'stable', 'bug', 'error', 'issue', 'problem', 'excellent'],
      'Value': ['price', 'cost', 'expensive', 'cheap', 'value', 'worth', 'money', 'affordable']
    };

    const topics = Object.entries(topicKeywords).map(([topicName, keywords]) => {
      const relatedTexts = cleanedTexts.filter(text =>
        keywords.some(keyword => text.toLowerCase().includes(keyword))
      );

      if (relatedTexts.length === 0) return null;

      const topicSentiment = this.analyzeSentiment(relatedTexts);
      
      return {
        id: topicName.toLowerCase().replace(/\s+/g, '-'),
        name: topicName,
        keywords,
        frequency: relatedTexts.length,
        averageSentiment: topicSentiment.overall.score,
        examples: relatedTexts.slice(0, 3)
      };
    }).filter(Boolean) as TopicAnalysis['topics'];

    // Find uncategorized texts
    const categorizedTexts = new Set<string>();
    topics.forEach(topic => {
      cleanedTexts.forEach(text => {
        if (topic.keywords.some(keyword => text.toLowerCase().includes(keyword))) {
          categorizedTexts.add(text);
        }
      });
    });

    const uncategorized = cleanedTexts.filter(text => !categorizedTexts.has(text));

    return {
      topics: topics.sort((a, b) => b.frequency - a.frequency),
      uncategorized: uncategorized.slice(0, 10) // Limit uncategorized examples
    };
  }

  /**
   * Analyze language metrics and readability
   */
  analyzeLanguageMetrics(texts: string[]): LanguageMetrics {
    if (texts.length === 0) {
      return {
        averageLength: 0,
        readabilityScore: 0,
        vocabularyDiversity: 0,
        mostCommonWords: [],
        languageComplexity: 'simple'
      };
    }

    const cleanedTexts = texts.map(text => this.cleanText(text));
    
    // Calculate average length
    const totalLength = cleanedTexts.reduce((sum, text) => sum + text.length, 0);
    const averageLength = totalLength / cleanedTexts.length;

    // Calculate vocabulary diversity (unique words / total words)
    const allWords = cleanedTexts.flatMap(text => this.tokenize(text));
    const uniqueWords = new Set(allWords.map(word => word.toLowerCase()));
    const vocabularyDiversity = uniqueWords.size / allWords.length;

    // Find most common words
    const wordCounts = this.countWords(allWords);
    const mostCommonWords = Object.entries(wordCounts)
      .filter(([word]) => !this.stopWords.has(word.toLowerCase()))
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    // Calculate simple readability score (based on sentence length and word complexity)
    const readabilityScore = this.calculateReadabilityScore(cleanedTexts);
    
    // Determine language complexity
    let languageComplexity: LanguageMetrics['languageComplexity'] = 'simple';
    if (averageLength > 100 && vocabularyDiversity > 0.7) {
      languageComplexity = 'complex';
    } else if (averageLength > 50 || vocabularyDiversity > 0.5) {
      languageComplexity = 'moderate';
    }

    return {
      averageLength,
      readabilityScore,
      vocabularyDiversity,
      mostCommonWords,
      languageComplexity
    };
  }

  /**
   * Compare sentiment across different segments
   */
  compareSentimentBySegment(
    texts: string[], 
    segments: string[]
  ): { [segment: string]: SentimentAnalysis } {
    const segmentedTexts = groupBy(
      texts.map((text, index) => ({ text, segment: segments[index] })),
      'segment'
    );

    const results: { [segment: string]: SentimentAnalysis } = {};
    
    Object.entries(segmentedTexts).forEach(([segment, items]) => {
      const segmentTexts = items.map(item => item.text);
      results[segment] = this.analyzeSentiment(segmentTexts);
    });

    return results;
  }

  // Private helper methods

  private initializeStopWords(): void {
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
      'above', 'below', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
      'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
      'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
      'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just',
      'should', 'now', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
      'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his',
      'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they',
      'them', 'their', 'theirs', 'themselves'
    ]);
  }

  private initializeEmotionKeywords(): void {
    this.emotionKeywords = {
      joy: ['happy', 'excited', 'pleased', 'delighted', 'thrilled', 'amazing', 'wonderful', 'great', 'fantastic', 'excellent'],
      anger: ['angry', 'frustrated', 'annoying', 'terrible', 'awful', 'hate', 'disgusting', 'furious', 'irritated', 'mad'],
      fear: ['scared', 'worried', 'anxious', 'nervous', 'afraid', 'frightened', 'concerned', 'uncertain', 'doubtful'],
      sadness: ['sad', 'disappointed', 'upset', 'depressed', 'down', 'gloomy', 'miserable', 'unhappy', 'dejected'],
      surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'unexpected', 'sudden', 'startled'],
      disgust: ['disgusting', 'revolting', 'gross', 'unpleasant', 'nasty', 'horrible', 'repulsive']
    };
  }

  private cleanText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private tokenize(text: string): string[] {
    return text.split(/\s+/).filter(word => word.length > 0);
  }

  private countWords(words: string[]): { [word: string]: number } {
    const counts: { [word: string]: number } = {};
    words.forEach(word => {
      const lowerWord = word.toLowerCase();
      counts[lowerWord] = (counts[lowerWord] || 0) + 1;
    });
    return counts;
  }

  private getTopWords(words: string[], limit: number): string[] {
    const counts = this.countWords(words);
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([word]) => word);
  }

  private extractPhrases(texts: string[]): string[] {
    const phrases: string[] = [];
    
    texts.forEach(text => {
      const words = this.tokenize(text);
      
      // Extract 2-word and 3-word phrases
      for (let i = 0; i < words.length - 1; i++) {
        if (!this.stopWords.has(words[i]) && !this.stopWords.has(words[i + 1])) {
          phrases.push(`${words[i]} ${words[i + 1]}`);
        }
      }
      
      for (let i = 0; i < words.length - 2; i++) {
        if (!this.stopWords.has(words[i]) && !this.stopWords.has(words[i + 2])) {
          phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
        }
      }
    });
    
    return phrases;
  }

  private identifyThemes(phrases: string[]): { name: string; keywords: string[] }[] {
    const phraseCounts = this.countWords(phrases);
    const topPhrases = Object.entries(phraseCounts)
      .filter(([, count]) => count >= 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20);

    return topPhrases.map(([phrase]) => ({
      name: phrase,
      keywords: phrase.split(' ')
    }));
  }

  private categorizeInsight(
    content: string, 
    sentiment: 'positive' | 'negative' | 'neutral',
    questionType?: string
  ): TextInsight['type'] {
    if (sentiment === 'positive') {
      return 'praise';
    } else if (sentiment === 'negative') {
      if (content.includes('problem') || content.includes('issue') || content.includes('bug')) {
        return 'issue';
      }
      return 'complaint';
    } else {
      if (content.includes('suggest') || content.includes('improve') || content.includes('should')) {
        return 'suggestion';
      }
      return 'theme';
    }
  }

  private calculateReadabilityScore(texts: string[]): number {
    if (texts.length === 0) return 0;

    let totalScore = 0;
    
    texts.forEach(text => {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const words = this.tokenize(text);
      const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);
      
      if (sentences.length === 0 || words.length === 0) return;
      
      const averageWordsPerSentence = words.length / sentences.length;
      const averageSyllablesPerWord = syllables / words.length;
      
      // Simplified Flesch Reading Ease Score
      const score = 206.835 - (1.015 * averageWordsPerSentence) - (84.6 * averageSyllablesPerWord);
      totalScore += Math.max(0, Math.min(100, score));
    });
    
    return totalScore / texts.length;
  }

  private countSyllables(word: string): number {
    // Simple syllable counting heuristic
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = 'aeiouy';
    let count = 0;
    let prevWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !prevWasVowel) {
        count++;
      }
      prevWasVowel = isVowel;
    }
    
    // Handle silent 'e'
    if (word.endsWith('e')) {
      count--;
    }
    
    return Math.max(1, count);
  }

  private analyzeEmotions(texts: string[]): SentimentAnalysis['emotions'] {
    const emotions: { [emotion: string]: number } = {};
    
    Object.keys(this.emotionKeywords).forEach(emotion => {
      emotions[emotion] = 0;
    });
    
    texts.forEach(text => {
      const cleanedText = this.cleanText(text);
      
      Object.entries(this.emotionKeywords).forEach(([emotion, keywords]) => {
        const matches = keywords.filter(keyword => 
          cleanedText.includes(keyword)
        ).length;
        emotions[emotion] += matches;
      });
    });
    
    // Normalize by text count
    Object.keys(emotions).forEach(emotion => {
      emotions[emotion] = emotions[emotion] / texts.length;
    });
    
    return emotions as SentimentAnalysis['emotions'];
  }

  private determineSentimentLabel(score: number): 'positive' | 'negative' | 'neutral' {
    if (score > 1) return 'positive';
    if (score < -1) return 'negative';
    return 'neutral';
  }

  private calculateConfidence(score: number, sampleSize: number): number {
    const absScore = Math.abs(score);
    const sizeBonus = Math.min(sampleSize / 100, 1); // Higher confidence with more samples
    return Math.min((absScore * 0.2 + sizeBonus * 0.8) * 100, 100);
  }

  private getEmptySentimentAnalysis(): SentimentAnalysis {
    return {
      overall: {
        score: 0,
        comparative: 0,
        label: 'neutral',
        confidence: 0
      },
      breakdown: {
        positive: 0,
        negative: 0,
        neutral: 100
      },
      keywords: {
        positive: [],
        negative: []
      }
    };
  }
}

// Singleton instance
export const textAnalyzer = new TextAnalyzer();
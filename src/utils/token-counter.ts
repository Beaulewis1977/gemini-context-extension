import { GeminiClient, GeminiClientConfig } from './gemini-client.js';

/**
 * Counts or estimates token usage for text.
 *
 * When configured with a Gemini API key, uses the official countTokens API for accurate counts.
 * Falls back to heuristic estimation (~3.5 chars/token) when API is unavailable.
 */
export class TokenCounter {
  private geminiClient: GeminiClient;
  private useApi: boolean;

  constructor(config?: GeminiClientConfig) {
    this.geminiClient = new GeminiClient(config);
    this.useApi = config?.useApiForCounting ?? true;
  }

  /**
   * Count or estimate tokens for text.
   *
   * Uses Gemini API countTokens if available, otherwise falls back to heuristic estimation.
   *
   * @param text - The text to count tokens for
   * @param model - The model ID for counting (default: gemini-2.5-flash)
   * @returns Token count (real API count or estimated)
   * @throws {TypeError} If text is not a string
   */
  async count(text: string, model: string = 'gemini-2.5-flash'): Promise<number> {
    // Validate input
    if (text === null || text === undefined) {
      throw new TypeError('Text parameter cannot be null or undefined');
    }
    if (typeof text !== 'string') {
      throw new TypeError(`Text parameter must be a string, got ${typeof text}`);
    }
    if (text.length === 0) return 0;

    // Try to use API if available
    if (this.useApi && this.geminiClient.isAvailable()) {
      try {
        return await this.geminiClient.countTokens(text, model);
      } catch (error) {
        // Fall back to estimation if API fails
        console.warn('Gemini API token counting failed, using estimation:', error);
        return this.estimateTokens(text);
      }
    }

    // Fall back to estimation
    return this.estimateTokens(text);
  }

  /**
   * Batch count tokens for multiple texts
   *
   * @param texts - Array of texts to count
   * @param model - The model ID for counting
   * @returns Total token count
   * @throws {TypeError} If texts is not an array or contains non-strings
   */
  async countBatch(texts: string[], model: string = 'gemini-2.5-flash'): Promise<number> {
    if (!Array.isArray(texts)) {
      throw new TypeError('Texts parameter must be an array');
    }

    // Try to use API if available
    if (this.useApi && this.geminiClient.isAvailable()) {
      try {
        return await this.geminiClient.countTokensBatch(texts, model);
      } catch (error) {
        // Fall back to estimation if API fails
        console.warn('Gemini API batch token counting failed, using estimation:', error);
        return texts.reduce((sum, text) => sum + this.estimateTokens(text), 0);
      }
    }

    // Fall back to estimation
    return texts.reduce((sum, text) => sum + this.estimateTokens(text), 0);
  }

  /**
   * Estimates token count using heuristic (synchronous fallback)
   *
   * @param text - The text to estimate tokens for
   * @returns Estimated token count
   */
  private estimateTokens(text: string): number {
    if (!text || text.length === 0) return 0;
    // Gemini uses SentencePiece tokenization (~3.5 chars per token on average)
    return Math.ceil(text.length / 3.5);
  }

  /**
   * Legacy synchronous estimation method (kept for backwards compatibility)
   *
   * @deprecated Use count() method instead for accurate API-based counting
   * @param text - The text to estimate tokens for
   * @returns Estimated token count
   */
  estimate(text: string): number {
    if (text === null || text === undefined) {
      throw new TypeError('Text parameter cannot be null or undefined');
    }
    if (typeof text !== 'string') {
      throw new TypeError(`Text parameter must be a string, got ${typeof text}`);
    }
    return this.estimateTokens(text);
  }

  /**
   * Legacy synchronous batch estimation (kept for backwards compatibility)
   *
   * @deprecated Use countBatch() method instead for accurate API-based counting
   * @param texts - Array of texts to estimate
   * @returns Total estimated token count
   */
  estimateBatch(texts: string[]): number {
    if (!Array.isArray(texts)) {
      throw new TypeError('Texts parameter must be an array');
    }
    return texts.reduce((sum, text) => sum + this.estimateTokens(text), 0);
  }

  /**
   * Check if API-based counting is available
   */
  isApiAvailable(): boolean {
    return this.geminiClient.isAvailable();
  }
}

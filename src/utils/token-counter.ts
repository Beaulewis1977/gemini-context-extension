export class TokenCounter {
  /**
   * Estimates token count for text using a heuristic.
   *
   * IMPORTANT: This is a LOCAL ESTIMATION only, not real token counts from Gemini API.
   * Gemini uses SentencePiece tokenization (~3.5 chars per token on average).
   * For accurate counts, use the Gemini API countTokens endpoint.
   *
   * @param text - The text to estimate tokens for
   * @returns Estimated token count
   * @throws {TypeError} If text is not a string
   */
  estimate(text: string): number {
    if (text === null || text === undefined) {
      throw new TypeError('Text parameter cannot be null or undefined');
    }
    if (typeof text !== 'string') {
      throw new TypeError(`Text parameter must be a string, got ${typeof text}`);
    }
    if (text.length === 0) return 0;
    return Math.ceil(text.length / 3.5);
  }

  /**
   * Batch estimate for multiple texts
   *
   * @param texts - Array of texts to estimate
   * @returns Total estimated token count
   * @throws {TypeError} If texts is not an array or contains non-strings
   */
  estimateBatch(texts: string[]): number {
    if (!Array.isArray(texts)) {
      throw new TypeError('Texts parameter must be an array');
    }
    return texts.reduce((sum, text) => sum + this.estimate(text), 0);
  }
}

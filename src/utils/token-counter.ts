export class TokenCounter {
  /**
   * Estimates token count for text.
   * Gemini uses SentencePiece tokenization (~3.5 chars per token on average)
   */
  estimate(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 3.5);
  }

  /**
   * Batch estimate for multiple texts
   */
  estimateBatch(texts: string[]): number {
    return texts.reduce((sum, text) => sum + this.estimate(text), 0);
  }
}

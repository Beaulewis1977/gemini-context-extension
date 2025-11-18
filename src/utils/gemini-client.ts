import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Configuration for Gemini API client
 */
export interface GeminiClientConfig {
  apiKey?: string;
  useApiForCounting?: boolean;
}

/**
 * Client for interacting with the Gemini API
 *
 * Supports token counting via the official Gemini API countTokens endpoint.
 * Falls back to heuristic estimation if API key is not configured.
 */
export class GeminiClient {
  private client: GoogleGenerativeAI | null = null;
  private apiKey: string | null = null;
  private useApi: boolean = false;

  constructor(config?: GeminiClientConfig) {
    // Try to get API key from config, then environment variable
    this.apiKey = config?.apiKey || process.env.GEMINI_API_KEY || null;
    this.useApi = config?.useApiForCounting ?? true;

    if (this.apiKey && this.useApi) {
      try {
        this.client = new GoogleGenerativeAI(this.apiKey);
      } catch (error) {
        console.error('Failed to initialize Gemini API client:', error);
        this.client = null;
      }
    }
  }

  /**
   * Check if the API client is available and configured
   */
  isAvailable(): boolean {
    return this.client !== null && this.apiKey !== null;
  }

  /**
   * Count tokens using the official Gemini API
   *
   * @param text - The text to count tokens for
   * @param model - The model ID to use for counting (default: gemini-2.5-flash)
   * @returns Token count from the API
   * @throws Error if API is not available or request fails
   */
  async countTokens(text: string, model: string = 'gemini-2.5-flash'): Promise<number> {
    if (!this.client) {
      throw new Error(
        'Gemini API client not initialized. Set GEMINI_API_KEY environment variable.'
      );
    }

    try {
      const generativeModel = this.client.getGenerativeModel({ model });
      const result = await generativeModel.countTokens(text);
      return result.totalTokens;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to count tokens via Gemini API: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Batch count tokens for multiple texts
   *
   * @param texts - Array of texts to count
   * @param model - The model ID to use for counting
   * @returns Total token count
   * @throws Error if API is not available or request fails
   */
  async countTokensBatch(texts: string[], model: string = 'gemini-2.5-flash'): Promise<number> {
    if (!this.client) {
      throw new Error(
        'Gemini API client not initialized. Set GEMINI_API_KEY environment variable.'
      );
    }

    let total = 0;
    for (const text of texts) {
      const count = await this.countTokens(text, model);
      total += count;
    }
    return total;
  }
}

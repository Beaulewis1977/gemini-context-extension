import { promises as fs } from 'fs';
import { join, dirname, resolve, parse } from 'path';

/**
 * Finds the .gemini directory by walking up from the current working directory
 * Returns the full path to .gemini directory or null if not found
 */
export async function findGeminiDirectory(
  startPath: string = process.cwd()
): Promise<string | null> {
  let currentPath = resolve(startPath);
  const root = parse(currentPath).root;
  const maxDepth = 50; // Safety limit
  let depth = 0;

  while (currentPath !== root && depth < maxDepth) {
    const geminiPath = join(currentPath, '.gemini');

    try {
      const stat = await fs.stat(geminiPath);
      if (stat.isDirectory()) {
        return geminiPath;
      }
    } catch {
      // Directory doesn't exist, continue
    }

    currentPath = dirname(currentPath);
    depth++;
  }

  return null;
}

/**
 * Checks if a file exists
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

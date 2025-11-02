type ToolStatus = 'success' | 'failure';

interface ToolRun {
  tool: string;
  durationMs: number;
  status: ToolStatus;
  timestamp: string;
  error?: string;
}

interface ToolSummary {
  tool: string;
  runs: number;
  failures: number;
  avgDurationMs: number;
  lastRun: string;
}

const runs: ToolRun[] = [];

function now(): number {
  return Date.now();
}

function record(tool: string, durationMs: number, status: ToolStatus, error?: unknown): void {
  runs.push({
    tool,
    durationMs,
    status,
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? error.message : error ? String(error) : undefined,
  });
}

export function withProfiling<Params, Result>(
  tool: string,
  handler: (params: Params) => Promise<Result>,
  onError?: (error: unknown) => Result
): (params: Params) => Promise<Result> {
  return async (params: Params): Promise<Result> => {
    const started = now();
    try {
      const result = await handler(params);
      record(tool, now() - started, 'success');
      return result;
    } catch (error) {
      record(tool, now() - started, 'failure', error);
      if (onError) {
        return onError(error);
      }
      throw error;
    }
  };
}

function summarizeRuns(): ToolSummary[] {
  const stats = new Map<
    string,
    { runs: number; failures: number; totalDuration: number; lastRun: string }
  >();

  for (const run of runs) {
    const current = stats.get(run.tool) || {
      runs: 0,
      failures: 0,
      totalDuration: 0,
      lastRun: run.timestamp,
    };

    current.runs += 1;
    current.totalDuration += run.durationMs;
    if (run.status === 'failure') {
      current.failures += 1;
    }
    if (run.timestamp > current.lastRun) {
      current.lastRun = run.timestamp;
    }

    stats.set(run.tool, current);
  }

  return Array.from(stats.entries())
    .map(([tool, value]) => ({
      tool,
      runs: value.runs,
      failures: value.failures,
      avgDurationMs: value.totalDuration / value.runs,
      lastRun: value.lastRun,
    }))
    .sort((a, b) => a.tool.localeCompare(b.tool));
}

export function getProfilerSummary(): ToolSummary[] {
  return summarizeRuns();
}

export function generatePerformanceReport(): string {
  const summary = summarizeRuns();
  if (summary.length === 0) {
    return 'No tool executions recorded yet.';
  }

  const headers = ['Tool', 'Times Run', 'Avg Duration (ms)', 'Failures', 'Last Run'];
  const rows = summary.map((item) => [
    item.tool,
    item.runs.toString(),
    item.avgDurationMs.toFixed(2),
    item.failures.toString(),
    item.lastRun,
  ]);

  const widths = headers.map((header, column) =>
    Math.max(header.length, ...rows.map((row) => row[column].length))
  );

  const formatRow = (values: string[]): string =>
    values.map((value, index) => value.padEnd(widths[index])).join(' | ');

  const separator = widths.map((width) => '-'.repeat(width)).join('-+-');

  return [formatRow(headers), separator, ...rows.map((row) => formatRow(row))].join('\n');
}

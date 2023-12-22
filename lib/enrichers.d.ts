import { StatisticalHistogram } from './histogram';

/**
 * The benchmark enricher result.
 */
export interface BenchmarkEnricherResult {
  /**
   * The name of the enricher.
   */
  name: string;

  /**
   * The result properties of an enricher.
   */
  [key: string]: any;
}

/**
 * The options that can be used to customize the clock template.
 */
export interface BenchmarkEnricherClockTemplate {
  /**
   * Tells if the benchmark is managed or not.
   */
  managed: boolean;

  /**
   * The name of the globalThis variable.
   */
  globalThisVar: string;

  /**
   * The name of the context variable that you can use to store information.
   */
  contextVar: string;

  /**
   * The name of the benchmark variable that you can use to reference the benchmark.
   * This variable exposes only one property, the `fn` function.
   */
  benchVar: string;

  /**
   * If the benchmark function is asynchronous, this variable will be `await `, otherwise it will be an empty string.
   */
  awaitOrEmpty: string;
}

export interface BenchmarkEnricherStatic {
  /**
   * Check if this enricher is supported.
   * Useful to test v8 flags or any other thing that might not be available.
   * This method should be static.
   *
   * @static
   */
  isSupported(): boolean;
}

/**
 * The Benchmark Enricher that can be used to extend and inject code before/after the clock of the benchmark.
 */
export interface BenchmarkEnricher {
  /**
   * Reset the state of this enricher, to enabled it to be used again.
   */
  reset(): void;

  /**
   * Returns the code template to be injected before starting the clock of the benchmark.
   */
  beforeClockTemplate?(options: BenchmarkEnricherClockTemplate): string;

  /**
   * Returns the code template to be injected after the clock of the benchmark finishes.
   */
  afterClockTemplate?(options: BenchmarkEnricherClockTemplate): string;

  /**
   * Executed after the clock of the benchmark finishes.
   */
  onCompleteClock?(): string;

  /**
   * Executed after the benchmark finishes to run.
   */
  onCompleteBenchmark?(): string;

  /**
   * Returns the output of this enricher to be used by the reporter.
   */
  getReport(): string;

  /**
   * Returns the output of this enricher.
   */
  getResult<TResult extends BenchmarkEnricherResult>(): TResult;
}

/**
 * The result of the {@link V8OptimizeOnNextCallEnricher}
 */
export interface V8OptimizeOnNextCallEnricherResult extends BenchmarkEnricherResult {
  /**
   * The list of V8 optimization statuses captured.
   * Each value can represent multiple status using bitset, check the reference to learn more.
   *
   * @reference https://github.com/NathanaelA/v8-Natives/blob/3194dcac0bc7786d0933a9c54eec946163aee480/lib/v8-node.js#L78
   */
  optimizationStatuses: number[];
}

/**
 * Enricher that applies %OptimizeFunctionOnNextCall on the benchmark function before running the clock.
 */
export class V8OptimizeOnNextCallEnricher implements BenchmarkEnricher {
  /**
   * @inheritDoc
   */
  static isSupported(): boolean;

  /**
   * @inheritDoc
   */
  reset(): void;

  /**
   * @inheritDoc
   */
  beforeClockTemplate?(options: BenchmarkEnricherClockTemplate): string;

  /**
   * @inheritDoc
   */
  afterClockTemplate?(options: BenchmarkEnricherClockTemplate): string;

  /**
   * @inheritDoc
   */
  onCompleteClock?(): string;

  /**
   * @inheritDoc
   */
  getReport(): string;

  /**
   * @inheritDoc
   */
  getResult<TResult = V8OptimizeOnNextCallEnricherResult>(): TResult;
}

/**
 * Enricher that applies %NeverOptimizeFunction on the benchmark function before running the clock.
 */
export class V8NeverOptimizeEnricher implements BenchmarkEnricher {
  /**
   * @inheritDoc
   */
  static isSupported(): boolean;

  /**
   * @inheritDoc
   */
  reset(): void;

  /**
   * @inheritDoc
   */
  beforeClockTemplate?(options: BenchmarkEnricherClockTemplate): string;

  /**
   * @inheritDoc
   */
  getReport(): string;

  /**
   * @inheritDoc
   */
  getResult<TResult = BenchmarkEnricherResult>(): TResult;
}

/**
 * The result of the {@link MemoryEnricher}
 */
export interface MemoryEnricherResult extends BenchmarkEnricherResult {
  /**
   * The histogram with the heapUsed + external.
   */
  histogram: StatisticalHistogram;
}

/**
 * Enrichers that uses {@link process.memoryUsage} to detect the heap allocated during the clock of the benchmark.
 * This enricher sums the `heapUsed` and `external` that was recorded before/after the clock of the benchmark.
 */
export class MemoryEnricher implements BenchmarkEnricher {
  /**
   * @inheritDoc
   */
  static isSupported(): boolean;

  /**
   * @inheritDoc
   */
  reset(): void;

  /**
   * @inheritDoc
   */
  beforeClockTemplate?(options: BenchmarkEnricherClockTemplate): string;

  /**
   * @inheritDoc
   */
  afterClockTemplate?(options: BenchmarkEnricherClockTemplate): string;

  /**
   * @inheritDoc
   */
  onCompleteClock?(): string;

  /**
   * @inheritDoc
   */
  onCompleteBenchmark?(): string;

  /**
   * @inheritDoc
   */
  getReport(): string;

  /**
   * @inheritDoc
   */
  getResult<TResult = MemoryEnricherResult>(): TResult;
}

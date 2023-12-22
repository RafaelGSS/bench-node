import { StatisticalHistogram } from './histogram';
import { BenchmarkEnricherResult } from './enrichers';

/**
 * The result of the run of the benchmark.
 */
export interface BenchmarkResult {
  /**
   * The amount of operations per second that this benchmark function performed.
   */
  opsSec: number;

  /**
   * The amount of times the benchmark function was called.
   */
  iterations: number;

  /**
   * The histogram with the duration of each clock.
   */
  histogram: StatisticalHistogram,

  /**
   * The array with the result of the enrichers.
   */
  enrichers: BenchmarkEnricherResult[];
}

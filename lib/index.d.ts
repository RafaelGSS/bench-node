import { BenchmarkEnricher } from './enrichers';
import { BenchmarkResult } from './lifecycle';
import { ManagedTimer } from './clock';

/**
 * The benchmark function when timer is managed by the user.
 */
export type BenchmarkFunctionManaged = (timer: ManagedTimer) => unknown;

/**
 * The benchmark function when timer is managed by the library.
 */
export type BenchmarkFunctionUnmanaged = () => unknown;

/**
 * The benchmark function.
 */
export type BenchmarkFunction = BenchmarkFunctionManaged | BenchmarkFunctionUnmanaged;

/**
 * The benchmark interface
 */
declare class Benchmark {
  /**
   * The name of the benchmark
   */
  name: string;

  /**
   * The benchmark function that will be evaluated.
   */
  fn: BenchmarkFunction;

  /**
   * Returns the minimum allowed time to this benchmark run each cycle of the clock.
   */
  minTime: number;

  /**
   * Returns the maximum allowed time to this benchmark run the entire clock.
   */
  maxTime: number;

  /**
   * Retrieves the enrichers applied in this benchmark.
   */
  enrichers: BenchmarkEnricher[];
}

/**
 * The options to customize the {@link Suite}
 */
export interface SuiteOptions {
  /**
   * The reporter called when a benchmark run finishes
   *
   * @default It will print to the console by default
   */
  reporter?: (bench: Benchmark, result: BenchmarkResult) => void;
}

/**
 * The options to customize the benchmark
 */
export interface BenchmarkOptions {
  /**
   * The minimum time we should execute the cycle
   *
   * @default 0.05
   */
  minTime?: number;
  /**
   * The maximum amount of time the benchmark should run
   *
   * @default 0.5
   */
  maxTime?: number;
}

/**
 * @reference https://github.com/nestjs/nest/blob/18335ffa9d53d7efd4f1529761f3539f035aaa79/packages/common/interfaces/type.interface.ts#L1
 */
export interface ClassType<T = any> extends Function {
  new(...args: any[]): T;
}

/**
 * The options to call {@link Suite.run}
 */
export interface SuiteRunOptions {
  /**
   * The list of enrichers that will be used by the benchmarks.
   *
   * @example```js
   * const suite = new Suite();
   *
   * suite
   *   .add(`new Uint32Array(1024)`, function () {
   *     return new Uint32Array(1024);
   *   })
   *   .run({
   *     enrichers: [
   *       V8OptimizeOnNextCallEnricher,
   *       MemoryEnricher,
   *     ],
   *   });
   * ```
   */
  enrichers?: ClassType<BenchmarkEnricher>[];
}

/**
 * The suite to add the benchmarks that will be executed.
 *
 * @example```js
 * const suite = new Suite();
 *
 * suite.add('split text with two words', () => 'my test'.split(' '));
 * suite.add('split text with three words', () => 'my test word'.split(' '));
 *
 * // by default, the results will also be printed to the console.
 * const result = await suite.run();
 * ```
 */
export class Suite {
  constructor(options?: SuiteOptions);

  /**
   * Add a new benchmark to run.
   *
   * @param name The name of this benchmark
   * @param options The options for this benchmark
   * @param fn The function to be evaluated
   */
  add(name: string, options: BenchmarkOptions, fn: () => unknown): Suite;

  /**
   * Add a new benchmark to run.
   *
   * @param name The name of this benchmark
   * @param fn The function to be evaluated
   * @param options The options for this benchmark
   */
  add(name: string, fn: BenchmarkFunction, options?: BenchmarkOptions): Suite;

  /**
   * Run this suite
   */
  run(options?: SuiteRunOptions): Promise<BenchmarkResult[]>;
}

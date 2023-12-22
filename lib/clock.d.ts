/**
 * The managed timer used during tear-up and teardown of the benchmark function.
 */
export class ManagedTimer {
  /**
   * Returns the recommended value to be used to benchmark your code.
   */
  get count(): number;

  /**
   * Starts the timer
   */
  start(): void;

  /**
   * Stops the timer
   *
   * @param iterations The amount of times the benchmark was executed. Defaults to 1.
   */
  end(iterations?: number): void;
}

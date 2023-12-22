/**
 * Represents a statistical histogram.
 */
export class StatisticalHistogram {
  /**
   * Retrieves an array of number samples.
   *
   * @returns {number[]} An array of number samples.
   */
  get samples(): number[];

  /**
   * Retrieves the minimum value from samples.
   *
   * @returns {number} The minimum value from samples.
   */
  get min(): number;

  /**
   * Returns the maximum value from samples.
   *
   * @returns {number} The maximum value from samples.
   */
  get max(): number;

  /**
   * Calculates the mean value of numbers.
   *
   * @returns {number} The mean value of numbers.
   */
  get mean(): number;

  /**
   * Retrieves the CV value.
   *
   * @reference https://en.wikipedia.org/wiki/Coefficient_of_variation
   * @return {number} The CV value.
   */
  get cv(): number;

  /**
   * Calculates the value at a given percentile.
   *
   * @param {number} percentile - The percentile value, ranging from 0 to 100.
   * @returns {number} The value at the specified percentile.
   */
  percentile(percentile: number): number;
}

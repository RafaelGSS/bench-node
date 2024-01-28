const { validateNumber } = require('./validators');

class StatisticalHistogram {
  all = [];
  min;
  max;
  mean;
  cv;

  /**
   * @returns {number[]}
   */
  get samples() {
    return this.all.slice();
  }

  /**
   * @param {number} percentile
   * @returns {number}
   */
  percentile(percentile) {
    validateNumber(percentile, 'percentile');

    if (Number.isNaN(percentile) || percentile < 0 || percentile > 100)
      throw new Error('Invalid percentile value. Must be a number between 0 and 100.');

    if (this.all.length === 0)
      return 0;

    if (percentile === 0)
      return this.all[0];

    return this.all[Math.ceil(this.all.length * (percentile / 100)) - 1];
  }

  /**
   * @param {number} value
   */
  record(value) {
    validateNumber(value, 'value', 0);

    this.all.push(value);
  }

  finish() {
    this.removeOutliers();

    this.calculateMinMax();
    this.calculateMean();
    this.calculateCv();
  }

  /**
   * References:
   * - https://gist.github.com/rmeissn/f5b42fb3e1386a46f60304a57b6d215a
   * - https://en.wikipedia.org/wiki/Interquartile_range
   */
  removeOutliers() {
    this.all.sort((a, b) => a - b);

    const size = this.all.length;

    if (size < 4)
      return;

    let q1, q3;

    if ((size - 1) / 4 % 1 === 0 || size / 4 % 1 === 0) {
      q1 = 1 / 2 * (this.all[Math.floor(size / 4) - 1] + this.all[Math.floor(size / 4)]);
      q3 = 1 / 2 * (this.all[Math.ceil(size * 3 / 4) - 1] + this.all[Math.ceil(size * 3 / 4)]);
    } else {
      q1 = this.all[Math.floor(size / 4)];
      q3 = this.all[Math.floor(size * 3 / 4)];
    }

    const iqr = q3 - q1;
    const minValue = q1 - iqr * 1.5;
    const maxValue = q3 + iqr * 1.5;

    this.all = this.all.filter(
      (value) => (value <= maxValue) && (value >= minValue),
    );
  }

  calculateMinMax() {
    this.min = Infinity;
    this.max = -Infinity;

    for (let i = 0; i < this.all.length; i++) {
      this.min = Math.min(this.all[i], this.min);
      this.max = Math.max(this.all[i], this.max);
    }
  }

  calculateMean() {
    if (this.all.length === 0) {
      this.mean = 0;
      return;
    }

    if (this.all.length === 1) {
      this.mean = this.all[0];
      return;
    }

    this.mean = this.all.reduce(
      (acc, value) => Math.min(Number.MAX_SAFE_INTEGER, acc + value),
      0,
    ) / this.all.length;
  }

  /**
   * References:
   * - https://en.wikipedia.org/wiki/Coefficient_of_variation
   * - https://github.com/google/benchmark/blob/159eb2d0ffb85b86e00ec1f983d72e72009ec387/src/statistics.ccL81-L88
   */
  calculateCv() {
    if (this.all.length < 2) {
      this.cv = 0;
      return;
    }

    const avgSquares = this.all.reduce(
      (acc, value) => Math.min(Number.MAX_SAFE_INTEGER, Math.pow(value, 2) + acc), 0,
    ) * (1 / this.all.length);

    const stddev = Math.sqrt(Math.max(0, this.all.length / (this.all.length - 1) * (avgSquares - (this.mean * this.mean))));

    this.cv = stddev / this.mean;
  }
}

module.exports = {
  StatisticalHistogram,
};

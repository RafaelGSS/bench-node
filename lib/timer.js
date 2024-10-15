const { validateNumber } = require('./validators');

const kUnmanagedTimerResult = Symbol('kUnmanagedTimerResult');

class Timer {
  constructor() {
    this.now = process.hrtime.bigint;
  }

  get scale() {
    return 1e9;
  }

  get resolution() {
    return 1 / 1e9;
  }

  /**
   * @param {number} timeInNs
   * @returns {string}
   */
  format(timeInNs) {
    validateNumber(timeInNs, 'timeInNs', 0);

    if (timeInNs > 1e9) {
      return `${(timeInNs / 1e9).toFixed(2)}s`;
    }

    if (timeInNs > 1e6) {
      return `${(timeInNs / 1e6).toFixed(2)}ms`;
    }

    if (timeInNs > 1e3) {
      return `${(timeInNs / 1e3).toFixed(2)}us`;
    }

    return `${(timeInNs).toFixed(2)}ns`;
  }
}

const timer = new Timer();

class ManagedTimer {
  startTime;
  endTime;
  iterations;
  recommendedCount;

  /**
   * @param {number} recommendedCount
   */
  constructor(recommendedCount) {
    this.recommendedCount = recommendedCount;
  }

  /**
   * Returns the recommended value to be used to benchmark your code
   * @returns {number}
   */
  get count() {
    return this.recommendedCount;
  }

  /**
   * Starts the timer
   */
  start() {
    this.startTime = timer.now();
  }

  /**
   * Stops the timer
   * @param {number} [iterations=1] The amount of iterations that run
   */
  end(iterations = 1) {
    this.endTime = timer.now();
    validateNumber(iterations, 'iterations', 1);
    this.iterations = iterations;
  }

  result() {
    return [Number(this.endTime - this.startTime), this.iterations]
  }

  [kUnmanagedTimerResult](context) {
    if (this.startTime === undefined)
      throw new Error('You forgot to call .start()');

    if (this.endTime === undefined)
      throw new Error('You forgot to call .end(count)');

    return [Number(this.endTime - this.startTime), this.iterations, context];
  }
}

module.exports = {
  timer,
  ManagedTimer,
  kUnmanagedTimerResult,
}

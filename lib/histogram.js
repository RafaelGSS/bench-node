const { validateNumber } = require("./validators");

/**
 * A class that calculates and maintains statistical measurements for a set of numeric samples.
 * Handles outlier removal, and calculates various statistical measures like mean, standard deviation,
 * coefficient of variation, and percentiles.
 */
class StatisticalHistogram {
	all = [];
	min;
	max;
	mean;
	cv;
	stddev;
	finished = false;

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
		validateNumber(percentile, "percentile");

		if (Number.isNaN(percentile) || percentile < 0 || percentile > 100)
			throw new Error(
				"Invalid percentile value. Must be a number between 0 and 100.",
			);

		if (this.all.length === 0) return 0;

		if (percentile === 0) return this.all[0];

		return this.all[Math.ceil(this.all.length * (percentile / 100)) - 1];
	}

	/**
	 * @param {number} value
	 */
	record(value) {
		validateNumber(value, "value", 0);

		this.all.push(value);
	}

	finish() {
		if (this.finished) return;

		this.finished = true;
		this.removeOutliers();

		this.calculateMinMax();
		this.calculateMean();
		this.calculateStd();
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

		if (size < 4) return;

		let q1;
		let q3;

		if (((size - 1) / 4) % 1 === 0 || (size / 4) % 1 === 0) {
			q1 =
				(1 / 2) *
				(this.all[Math.floor(size / 4) - 1] + this.all[Math.floor(size / 4)]);
			q3 =
				(1 / 2) *
				(this.all[Math.ceil((size * 3) / 4) - 1] +
					this.all[Math.ceil((size * 3) / 4)]);
		} else {
			q1 = this.all[Math.floor(size / 4)];
			q3 = this.all[Math.floor((size * 3) / 4)];
		}

		const iqr = q3 - q1;
		const minValue = q1 - iqr * 1.5;
		const maxValue = q3 + iqr * 1.5;

		this.all = this.all.filter(
			(value) => value <= maxValue && value >= minValue,
		);
	}

	calculateMinMax() {
		this.min = Number.POSITIVE_INFINITY;
		this.max = Number.NEGATIVE_INFINITY;

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

		this.mean =
			this.all.reduce(
				(acc, value) => Math.min(Number.MAX_SAFE_INTEGER, acc + value),
				0,
			) / this.all.length;
	}

	calculateStd() {
		if (this.all.length < 2) {
			this.stddev = 0;
			return;
		}
		const variance =
			this.all.reduce((acc, value) => {
				return acc + (value - this.mean) ** 2;
			}, 0) /
			(this.all.length - 1);
		this.stddev = Math.sqrt(variance);
	}

	/**
	 * References:
	 * - https://en.wikipedia.org/wiki/Coefficient_of_variation
	 * - https://github.com/google/benchmark/blob/159eb2d0ffb85b86e00ec1f983d72e72009ec387/src/statistics.ccL81-L88
	 */
	calculateCv() {
		if (this.all.length < 2 || this.mean === 0) {
			this.cv = 0;
			return;
		}

		this.cv = (this.stddev / this.mean) * 100;
	}
}

module.exports = {
	StatisticalHistogram,
};

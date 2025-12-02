// Welch's t-test implementation for benchmark comparison

function mean(arr) {
	if (arr.length === 0) return 0;
	return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

// Sample variance with Bessel's correction
function variance(arr, arrMean) {
	if (arr.length < 2) return 0;
	const m = arrMean !== undefined ? arrMean : mean(arr);
	return arr.reduce((sum, val) => sum + (val - m) ** 2, 0) / (arr.length - 1);
}

// Abramowitz and Stegun approximation
function erf(x) {
	const sign = x >= 0 ? 1 : -1;
	x = Math.abs(x);

	const a1 = 0.254829592;
	const a2 = -0.284496736;
	const a3 = 1.421413741;
	const a4 = -1.453152027;
	const a5 = 1.061405429;
	const p = 0.3275911;

	const t = 1.0 / (1.0 + p * x);
	const y =
		1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

	return sign * y;
}

// Lanczos approximation
function lnGamma(z) {
	const g = 7;
	const c = [
		0.99999999999980993, 676.5203681218851, -1259.1392167224028,
		771.32342877765313, -176.61502916214059, 12.507343278686905,
		-0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
	];

	if (z < 0.5) {
		return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
	}

	z -= 1;
	let x = c[0];
	for (let i = 1; i < g + 2; i++) {
		x += c[i] / (z + i);
	}
	const t = z + g + 0.5;
	return (
		0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x)
	);
}

// Incomplete beta function for t-distribution CDF
function incompleteBeta(a, b, x) {
	if (x === 0) return 0;
	if (x === 1) return 1;

	// Symmetry relation for stability
	if (x > (a + 1) / (a + b + 2)) {
		return 1 - incompleteBeta(b, a, 1 - x);
	}

	const lnBeta = lnGamma(a) + lnGamma(b) - lnGamma(a + b);
	const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lnBeta) / a;

	// Lentz's algorithm
	const maxIterations = 200;
	const epsilon = 1e-14;

	let f = 1;
	let c = 1;
	let d = 0;

	for (let m = 0; m <= maxIterations; m++) {
		let numerator;

		if (m === 0) {
			numerator = 1;
		} else if (m % 2 === 0) {
			const k = m / 2;
			numerator = (k * (b - k) * x) / ((a + 2 * k - 1) * (a + 2 * k));
		} else {
			const k = (m - 1) / 2;
			numerator =
				-((a + k) * (a + b + k) * x) / ((a + 2 * k) * (a + 2 * k + 1));
		}

		d = 1 + numerator * d;
		if (Math.abs(d) < epsilon) d = epsilon;
		d = 1 / d;

		c = 1 + numerator / c;
		if (Math.abs(c) < epsilon) c = epsilon;

		const delta = c * d;
		f *= delta;

		if (Math.abs(delta - 1) < epsilon) {
			break;
		}
	}

	return front * (f - 1);
}

function tDistCdf(t, df) {
	const x = df / (df + t * t);
	const prob = 0.5 * incompleteBeta(df / 2, 0.5, x);

	return t >= 0 ? 1 - prob : prob;
}

function welchTTest(sample1, sample2) {
	const n1 = sample1.length;
	const n2 = sample2.length;

	if (n1 < 2 || n2 < 2) {
		return {
			tStatistic: 0,
			degreesOfFreedom: 0,
			pValue: 1,
			significant: false,
			mean1: n1 > 0 ? mean(sample1) : 0,
			mean2: n2 > 0 ? mean(sample2) : 0,
			variance1: 0,
			variance2: 0,
		};
	}

	const mean1 = mean(sample1);
	const mean2 = mean(sample2);

	const var1 = variance(sample1, mean1);
	const var2 = variance(sample2, mean2);

	// Standard error of the difference
	const se1 = var1 / n1;
	const se2 = var2 / n2;
	const seTotal = se1 + se2;

	// Handle edge case where both variances are 0
	if (seTotal === 0) {
		return {
			tStatistic: 0,
			degreesOfFreedom: n1 + n2 - 2,
			pValue: mean1 === mean2 ? 1 : 0,
			significant: mean1 !== mean2,
			mean1,
			mean2,
			variance1: var1,
			variance2: var2,
		};
	}

	// Welch's t-statistic
	const t = (mean1 - mean2) / Math.sqrt(seTotal);

	// Welch-Satterthwaite degrees of freedom approximation
	const df =
		(seTotal * seTotal) / ((se1 * se1) / (n1 - 1) + (se2 * se2) / (n2 - 1));

	// Two-tailed p-value
	const pValue = 2 * (1 - tDistCdf(Math.abs(t), df));

	return {
		tStatistic: t,
		degreesOfFreedom: df,
		pValue,
		significant: pValue < 0.05, // 95% confidence level
		mean1,
		mean2,
		variance1: var1,
		variance2: var2,
	};
}

function getSignificanceStars(pValue) {
	if (pValue < 0.001) return "***";
	if (pValue < 0.01) return "**";
	if (pValue < 0.05) return "*";
	return "";
}

function compareBenchmarks(sample1, sample2, alpha = 0.05) {
	const result = welchTTest(sample1, sample2);

	let difference = "same";
	if (result.significant) {
		difference = result.mean1 > result.mean2 ? "faster" : "slower";
	}

	const confidence = ((1 - result.pValue) * 100).toFixed(2);
	const stars = getSignificanceStars(result.pValue);

	return {
		significant: result.pValue < alpha,
		pValue: result.pValue,
		confidence: `${confidence}%`,
		stars,
		difference,
		tStatistic: result.tStatistic,
		degreesOfFreedom: result.degreesOfFreedom,
	};
}

module.exports = {
	mean,
	variance,
	welchTTest,
	compareBenchmarks,
	tDistCdf,
	getSignificanceStars,
};

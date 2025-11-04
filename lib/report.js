const { textReport } = require("./reporter/text");
const { prettyReport } = require("./reporter/pretty");
const { chartReport } = require("./reporter/chart");
const { htmlReport } = require("./reporter/html");
const { jsonReport } = require("./reporter/json");
const { csvReport, toCSV } = require("./reporter/csv");

/**
 * @typedef {Object} BenchmarkResult
 * @property {string} name - The name of the benchmark
 * @property {number} opsSec - Operations per second
 * @property {number} iterations - Total number of iterations run
 * @property {Object} histogram - Statistical data about the benchmark runs
 * @property {Array} plugins - Results from plugins used during benchmarking
 */

/**
 * Exports various report generators for benchmark results
 * @type {Object}
 * @property {function(BenchmarkResult[]): void} chartReport - Generates a chart visualization of benchmark results
 * @property {function(BenchmarkResult[]): void} textReport - Generates a text report of benchmark results
 * @property {function(BenchmarkResult[]): void} htmlReport - Generates an HTML report of benchmark results
 * @property {function(BenchmarkResult[]): string} jsonReport - Generates a JSON report of benchmark results
 * @property {function(BenchmarkResult[]): string} csvReport - Generates a CSV report of benchmark results
 */
module.exports = {
	chartReport,
	textReport,
	prettyReport,
	htmlReport,
	jsonReport,
	csvReport,
	toCSV,
};

const { textReport } = require("./reporter/text");
const { chartReport } = require("./reporter/chart");
const { htmlReport } = require("./reporter/html");
const { jsonReport } = require("./reporter/json");
const { csvReport } = require("./reporter/csv");

module.exports = {
	chartReport,
	textReport,
	htmlReport,
	jsonReport,
	csvReport,
};

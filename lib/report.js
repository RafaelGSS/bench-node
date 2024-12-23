const { textReport } = require('./reporter/text');
const { chartReport } = require('./reporter/chart');
const { htmlReport } = require('./reporter/html');
const { jsonReport } = require('./reporter/json');

module.exports = {
  chartReport,
  textReport,
  htmlReport,
  jsonReport,
};

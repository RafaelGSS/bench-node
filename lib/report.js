const { textReport } = require('./reporter/text');
const { chartReport } = require('./reporter/chart');
const { htmlReport } = require('./reporter/html');

module.exports = {
  chartReport,
  textReport,
  htmlReport,
};

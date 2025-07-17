const { Suite, chartReport } = require('../../lib');
const assert = require('node:assert');

async function runSuiteOne() {
  const suite = new Suite({
    reporter: chartReport,
  });

  await suite
    .add('test 1', function () {
      const pattern = /[123]/g
    })
    .add('test 2', function () {
      const subject = '123123123123123123123123123123123123123123123123'
      const r = subject.replace(/1/g, 'a').replace(/2/g, 'b').replace(/3/g, 'c')
    })
    .run();
}

async function runSuiteTwo() {
  const suite = new Suite({
    reporter: chartReport,
    reporterOptions: {
      printHeader: false
    }
  });

  await suite
    .add('test 3', function () {
      const pattern = /[123]/g
    })
    .add('test 4', function () {
      const subject = '123123123123123123123123123123123123123123123123'
      const r = subject.replace(/1/g, 'a').replace(/2/g, 'b').replace(/3/g, 'c')
      assert.ok(r)
    })
    .run();
}

async function main() {
  await runSuiteOne()
  process.stdout.write('\n\n')
  await runSuiteTwo()
}

main()

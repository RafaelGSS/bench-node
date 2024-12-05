const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');

const { Suite, chartReport, htmlReport } = require('../lib');

describe('chartReport outputs benchmark results as a bar chart', async (t) => {
  let output = '';

  before(async () => {
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = function (data) {
      output += data;
    };

    const suite = new Suite({
      reporter: chartReport,
    });

    suite
      .add('single with matcher', function () {
        const pattern = /[123]/g
        const replacements = { 1: 'a', 2: 'b', 3: 'c' }
        const subject = '123123123123123123123123123123123123123123123123'
        const r = subject.replace(pattern, m => replacements[m])
        assert.ok(r);
      })
      .add('multiple replaces', function () {
        const subject = '123123123123123123123123123123123123123123123123'
        const r = subject.replace(/1/g, 'a').replace(/2/g, 'b').replace(/3/g, 'c')
        assert.ok(r);
      })
    await suite.run();

    process.stdout.write = originalStdoutWrite;
  });

  it('should include bar chart chars', () => {
    assert.ok(output.includes('█'));
  });

  it('should include ops/sec', () => {
    assert.ok(output.includes('ops/sec'));
  })
});

describe('htmlReport should create a file', async (t) => {
  let output = '';
  let htmlName = '';
  let htmlContent = '';

  before(async () => {
    const originalStdoutWrite = process.stdout.write;
    const originalWriteFileSync = fs.writeFileSync;

    fs.writeFileSync = function (name, content)  {
      htmlName = name;
      htmlContent = content;
    };

    process.stdout.write = function (data) {
      output += data;
    };

    const suite = new Suite({
      reporter: htmlReport,
    });

    suite
      .add('single with matcher', function () {
        const pattern = /[123]/g
        const replacements = { 1: 'a', 2: 'b', 3: 'c' }
        const subject = '123123123123123123123123123123123123123123123123'
        const r = subject.replace(pattern, m => replacements[m])
        assert.ok(r);
      })
      .add('Multiple replaces', function () {
        const subject = '123123123123123123123123123123123123123123123123'
        const r = subject.replace(/1/g, 'a').replace(/2/g, 'b').replace(/3/g, 'c')
        assert.ok(r);
      })
    await suite.run();

    fs.writeFileSync = originalWriteFileSync;
    process.stdout.write = originalStdoutWrite;
  });

  it('should print that a HTML file has been generated', () => {
    assert.ok(output.includes('HTML file has been generated'));
  });

  it('htmlName should be result.html', () => {
    assert.strictEqual(htmlName, 'result.html');
  });

  it('htmlContent should not be empty', () => {
    assert.ok(htmlContent.length > 100);
  });

  it('htmlContent bench suite should be used as class name', () => {
    assert.ok(htmlContent.includes('circle-Multiple-replaces'));
    assert.ok(htmlContent.includes('circle-single-with-matcher'));
  });

  it('htmlContent should not contain replace tags {{}}', () => {
    assert.ok(htmlContent.includes('{{') === false);
    assert.ok(htmlContent.includes('}}') === false);
  });
});

const { platform, arch, cpus, totalmem } = require('node:os');

const formatter = Intl.NumberFormat(undefined, {
  notation: 'standard',
  maximumFractionDigits: 2,
});

function drawBar(label, value, total, length = 30) {
  const percentage = value / total;
  const filledLength = Math.round(length * percentage);
  const bar = '█'.repeat(filledLength) + '-'.repeat(length - filledLength);

  const opsSecReported = value < 100 ?
    value.toFixed(2) :
    value.toFixed(0);
  process.stdout.write(`${label.padEnd(45)} | ${bar} | ${formatter.format(opsSecReported)} ops/sec\n`);
}

const environment = {
  platform: `${platform()} ${arch()}`,
  hardware: `${cpus().length} vCPUs | ${(totalmem() / (1024 ** 3)).toFixed(1)}GB Mem`,
};

function chartReport(results) {
  const maxOpsSec = Math.max(...results.map(b => b.opsSec));

  process.stdout.write(`Platform: ${environment.platform}\n` +
    `CPU Cores: ${environment.hardware}\n\n`);
  results.forEach(result => {
    drawBar(result.name, result.opsSec, maxOpsSec);
  });
}

module.exports = {
  chartReport,
};

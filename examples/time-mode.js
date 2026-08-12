const { Suite } = require('../lib');

const timeSuite = new Suite({
    benchmarkMode: 'time' // Set mode for the entire suite
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Use minSamples: 1 for long-running operations to avoid redundant runs
timeSuite.add('Async Delay 100ms (time)', { minSamples: 1 }, async () => {
    await delay(100);
});

timeSuite.add('Sync Busy Wait 50ms (time)', { minSamples: 1 }, () => {
    const start = Date.now();
    while (Date.now() - start < 50);
});

// repeatSuite runs multiple rounds; minSamples controls samples collected per round
timeSuite.add('Quick Sync Op with 5 repeats (time)', { repeatSuite: 5, minSamples: 1 }, () => {
    let x = 1 + 1;
});

// Default minSamples (10) collects multiple independent measurements per round
timeSuite.add('Quick Sync Op with default minSamples (time)', () => {
    let x = 1 + 1;
});


(async () => {
    console.log('\nRunning benchmark suite in TIME mode...');
    await timeSuite.run();
})();

const { Suite } = require('../lib');

const timeSuite = new Suite({
    benchmarkMode: 'time' // Set mode for the entire suite
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

timeSuite.add('Async Delay 100ms (time)', async () => {
    await delay(100);
});

timeSuite.add('Sync Busy Wait 50ms (time)', () => {
    const start = Date.now();
    while (Date.now() - start < 50);
});

timeSuite.add('Quick Sync Op with 5 repeats (time)', { repeatSuite: 5 }, () => {
    // This will run exactly once per repeat (5 times total)
    // and report the average time
    let x = 1 + 1;
});


(async () => {
    console.log('\nRunning benchmark suite in TIME mode...');
    await timeSuite.run();
})();

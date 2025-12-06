const { Suite } = require('../../lib');

const suite = new Suite({
  useWorkers: true,
});

suite
  .add('Using import without node: prefix', function () {
    return import('fs');
  })
  .add('Using import with node: prefix', function () {
    return import('node:fs');
  })
	.add('async test', async function (timer) {
		timer.start();
		let i = 0;
		while (i++ < timer.count) {
			await import("node:fs");
		}
		timer.end(timer.count);
	})
  .run();

const { Suite } = require('../../lib');

const suite = new Suite();

suite
  .add('Using includes', function () {
    const text = 'text/html,application/xhtml+xml,application/xml;application/json;q=0.9,image/avif,image/webp,*/*;q=0.8'
    const r = text.includes('application/json')
    return r;
  })
  .add('[Managed] Using includes', function (timer) {
    timer.start()
    for (let i = 0; i < timer.count; i++) {
      const text = 'text/html,application/xhtml+xml,application/xml;application/json;q=0.9,image/avif,image/webp,*/*;q=0.8'
      const r = text.includes('application/json')
    }
    timer.end(timer.count)
  })
  .run({ workerThreads: true });

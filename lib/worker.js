const { ManagedTimer, timer } = require('./timer');

async function unmanaged ({ fn, count }) {
  let i = 0;
  const deserializedFunction = new Function(fn);

  function DoNotOptimize(x) {}
  // Prevent DoNotOptimize from optimizing or being inlined.
  %NeverOptimizeFunction(DoNotOptimize);

  const startedAt = timer.now();
  for (; i < count; i++) {
    DoNotOptimize(await deserializedFunction());
  }

  const duration = Number(timer.now() - startedAt);
  return [duration, count];
}

async function managed ({ fn, count }) {
  const timer = new ManagedTimer(count);
  const deserializedFunction = new Function('timer', fn);

  function DoNotOptimize(x) {}
  // Prevent DoNotOptimize from optimizing or being inlined.
  %NeverOptimizeFunction(DoNotOptimize);

  DoNotOptimize(await deserializedFunction(timer));

  return timer.result();
}

unmanaged.unmanaged = unmanaged;
unmanaged.managed = managed;

module.exports = unmanaged;

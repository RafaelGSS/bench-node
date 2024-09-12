function unmanaged (bench, timer, count) {
  let i = 0;
  let context = {};

  function DoNotOptimize(x) {}
  // Prevent DoNotOptimize from optimizing or being inlined.
  %NeverOptimizeFunction(DoNotOptimize);

  const startedAt = timer.now();
  for (; i < count; i++) {
    // TODO: awaitOrEmpty?
    DoNotOptimize(await bench.fn());
  }

  const duration = Number(timer.now() - startedAt);
  return [duration, count, context];
}

function managed (bench, timer, kUnmanagedTimerResult) {
  let context = {};

  function DoNotOptimize(x) {}
  // Prevent DoNotOptimize from optimizing or being inlined.
  %NeverOptimizeFunction(DoNotOptimize);

  DoNotOptimize(await bench.fn(timer));

  const result = timer[kUnmanagedTimerResult](context);

  return result;
}

unmanaged.unmanaged = unmanaged;
unmanaged.managed = managed;

module.exports = unmanaged;

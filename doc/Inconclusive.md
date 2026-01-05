# Fixing Inconclusive Tests

t-tests are looking at the distribution of both sets of results and trying to determine if they overlap in a way that
makes the average value significant or just noise in the results. A run with a bimodal distribution for instance, caused
by problems with the machine the tests are running on or the NodeJS runtime doing things in the background. Here are a
few causes.

## Random Input Data

Variability in the inputs between runs can lead to big changes in the runtime of an algorithm. Particularly with code
that sorts, filters, or conditionally operates on input data, feeding them certain combinations of data will result in
wildly different run times from one loop to the next or occasionally from one sample to the next. The Central Limit
Theorem (that over a long enough time a situation will revert to the mean), does not invalidate the existence of the
Gambler's Paradox (that it will revert to the mean before I become bankrupt).

It is better to do your fuzzing in fuzz tests and pick representative data for your benchmarks. Partially informed by
the results of your fuzz tests, and other bug reports.

## Underprovisioned VM, Oversubscribed hardware

For a clean micro benchmark, we generally want to be the only one using the machine at the time. There are a number of
known issues running benchmarks on machines that are thermally throttling, or on cheap VMs that use best-effort to
allocate CPU time to the running processes. In particular, docker images with `cpu-shares` are especially poor targets
for running benchmarks because the quota might expire for one timeslice in the middle of one test or between benchmarks
in a single Suite. This creates an unfair advantage for the first test, and/or lots of noise in the results. We are
currently investigating ways to detect this sort of noise, and analyzing if the t-tests are sufficient to do so.

## Epicycles in GC or JIT compilation

If the warmup time is insufficient to get V8 to optimize the code, it may kick in during the middle of a sample, which
will introduce a bimodal distribution of answers (before, and after). There is currently not a way to adjust the warmup
time of `bench-node`, but should be added as a feature.

One of the nastiest performance issues to detect in garbage collected code is allocation epicycles. This happens when
early parts of a calculation create lots of temporary data but not sufficient to cross the incremental or full GC
threshold, so that the next function in a call sequence routinely gets hit with exceeding the threshold. This is
especially common in code that generates a JSON or HTML response to a series of calculations - it is the single biggest
allocation in the sequence, but it gets blamed in the performance report for the lion's share of the CPU time.

If you change the `minTime` up or down, that will alter the number of iterations per sample which may smooth out the
results. You can also try increasing `minSamples` to get more samples. But also take this as a suggestion that your code
may have a performance bug that is worth prioritizing.

Forcing GC in the teardown or setup methods between subsequent tests in a single Suite may help with some situations
when reordering the tests results in differences in runtime, but for the more general case, you may need to review the
code under test to make it 'play well' both with benchmarking and in production systems.

In production code, particularly where p9# values are used as a fitness test, it is sometimes better to chose the
algorithm with more consistent runtime over the one with supposedly better average runtime. This can also be true where
DDOS scenarios are possible - the attacker will always chose the worst, most assymetric request to send to your machine,
and mean response time will not matter one whit. If `bench-node` is complaining, the problem may not be `bench-node`.

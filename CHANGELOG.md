# Changelog

## [0.14.0](https://github.com/RafaelGSS/bench-node/compare/v0.13.0...v0.14.0) (2025-12-17)


### Features

* add dce detection plugin ([#131](https://github.com/RafaelGSS/bench-node/issues/131)) ([2e2a6be](https://github.com/RafaelGSS/bench-node/commit/2e2a6be87e7dc7562952dd53b9e34017e0822b8e))
* add t-test mode for statistical significance testing ([#133](https://github.com/RafaelGSS/bench-node/issues/133)) ([53e20aa](https://github.com/RafaelGSS/bench-node/commit/53e20aae67fbd747a05465b6ad824f56483e231a))
* Narrow the bar display by another couple of characters by using ANSI line drawing. ([#134](https://github.com/RafaelGSS/bench-node/issues/134)) ([814e88e](https://github.com/RafaelGSS/bench-node/commit/814e88e905da60d00615a2b95cfeed23b6034c7d))


### Bug Fixes

* Clock inaccuracy in libuv is causing flaky tests. ([cad6bfa](https://github.com/RafaelGSS/bench-node/commit/cad6bfac1b03f270da38c81f3d1703db95a7b0f4))
* implement support to timers to workers ([35eb144](https://github.com/RafaelGSS/bench-node/commit/35eb144908e76b73667ef6de9131c4d37425974b))


### Miscellaneous Chores

* Localize op/sec in text reporter ([#146](https://github.com/RafaelGSS/bench-node/issues/146)) ([18302e3](https://github.com/RafaelGSS/bench-node/commit/18302e369b3f430d35fe856177d0fd0a55592eaf))

## [0.13.0](https://github.com/RafaelGSS/bench-node/compare/v0.12.0...v0.13.0) (2025-11-27)


### Features

* export to&lt;format&gt; functions and rework some of the tests. ([960cb87](https://github.com/RafaelGSS/bench-node/commit/960cb87caf3e73c01550cf93127679991c928ef8))


### Miscellaneous Chores

* change printTree to formatTree ([d6ff418](https://github.com/RafaelGSS/bench-node/commit/d6ff418dcc50fbe256b89e9bd562521efc8b7095))
* Convert json reporter to allow json generation to string. ([cfc464c](https://github.com/RafaelGSS/bench-node/commit/cfc464c4709c1ed4415ff86d486a29dc39556708))
* Convert printResult to generate a line of output. ([4199a57](https://github.com/RafaelGSS/bench-node/commit/4199a578f29eec173b5c22a21affb80c9b415f07))
* extract toCSV from csv reporter. ([033dd4b](https://github.com/RafaelGSS/bench-node/commit/033dd4bdd8cd874d0fe985a0f6dae34666452e68))
* Extract toPretty() method ([c2e54a3](https://github.com/RafaelGSS/bench-node/commit/c2e54a36387ff812c461961724e66aa2389e4358))
* extract toText from text reporter ([db850ca](https://github.com/RafaelGSS/bench-node/commit/db850ca95b124fd8f4a1ce8dd140868be2f2de5d))
* Move lint after unit tests. ([e0c019d](https://github.com/RafaelGSS/bench-node/commit/e0c019d48c9bdd77dc934e2c5c15231fd1a3b836))
* Move short branch to top of conditional block. ([e7254b3](https://github.com/RafaelGSS/bench-node/commit/e7254b35286f58a18622c30aebea7d2e127542b7))
* Remove duplicate time code in pretty and text printers ([a977b97](https://github.com/RafaelGSS/bench-node/commit/a977b972adab5b947b290bb347c774d93ff011fd))
* Split out text only chart creation function. ([80538fa](https://github.com/RafaelGSS/bench-node/commit/80538fa6447fe542284a6f58d1d8f08c0d362696))
* Use report for tests. ([b14db92](https://github.com/RafaelGSS/bench-node/commit/b14db929b058f2a25717a0ff83f5f911c015fb66))

## [0.12.0](https://github.com/RafaelGSS/bench-node/compare/v0.11.0...v0.12.0) (2025-11-03)


### Features

* add several code refactor/fixes ([#123](https://github.com/RafaelGSS/bench-node/issues/123)) ([cf96c3d](https://github.com/RafaelGSS/bench-node/commit/cf96c3deaace1086df64dfa0424aeb5bbe90ca5f))
* Deduplicate the data summarization code. ([#120](https://github.com/RafaelGSS/bench-node/issues/120)) ([85bfd3e](https://github.com/RafaelGSS/bench-node/commit/85bfd3e8b4a7da047859c70a1ec5e43e81161c10))
* make minSamples option available per Suite creation ([#126](https://github.com/RafaelGSS/bench-node/issues/126)) ([152b945](https://github.com/RafaelGSS/bench-node/commit/152b94571e870246db75311e80b962451e2af9ca))


### Bug Fixes

* **plugins:** export plugin memory ([52bb536](https://github.com/RafaelGSS/bench-node/commit/52bb536117460cff49518881a5680b96ef06426c))


### Miscellaneous Chores

* **index.d.ts:** update exported types for plugins ([abc828f](https://github.com/RafaelGSS/bench-node/commit/abc828fd7f77fe6bb48aa239155e1ad4ca9f9e63))
* typo ([#125](https://github.com/RafaelGSS/bench-node/issues/125)) ([88aff41](https://github.com/RafaelGSS/bench-node/commit/88aff41f3b190a005fd33160b41a888f9227b3b4))


### Code Refactoring

* **plugins:** enable support for memory & fixes on types ([cd4f96e](https://github.com/RafaelGSS/bench-node/commit/cd4f96e5a48a3381242047c18fc082e293ef7723))


### Continuous Integration

* bump ci ([#124](https://github.com/RafaelGSS/bench-node/issues/124)) ([2d7ba17](https://github.com/RafaelGSS/bench-node/commit/2d7ba17eac29328a7d09393efe2692960c84c869))

## [0.11.0](https://github.com/RafaelGSS/bench-node/compare/v0.10.0...v0.11.0) (2025-09-22)


### Features

* add comparisson with other benchmark libs ([#106](https://github.com/RafaelGSS/bench-node/issues/106)) ([19de73f](https://github.com/RafaelGSS/bench-node/commit/19de73f3a3fb4f11e8ea1d746154c8f3391d0192))
* Allow for configurable column width for the chart output. ([#104](https://github.com/RafaelGSS/bench-node/issues/104)) ([315d551](https://github.com/RafaelGSS/bench-node/commit/315d551209e25827c844c0f4a301afa6e2bc276b))
* reduce NPM package size by adding files field to package.json ([#111](https://github.com/RafaelGSS/bench-node/issues/111)) ([a584269](https://github.com/RafaelGSS/bench-node/commit/a584269c8267a30a3fb9b0bb77fccf201f77381c))


### Bug Fixes

* optional iterations count for end(), add type tests ([a4dc145](https://github.com/RafaelGSS/bench-node/commit/a4dc145dee4dd53d331cd294771f83333efba7f6))


### Documentation

* add comprehensive library comparison document ([#109](https://github.com/RafaelGSS/bench-node/issues/109)) ([caa18a9](https://github.com/RafaelGSS/bench-node/commit/caa18a914f416be9f53357d2a2c8e2ca8a092c66))


### Miscellaneous Chores

* **main:** release 0.11.0.beta-1 ([b234ce7](https://github.com/RafaelGSS/bench-node/commit/b234ce76b8f03db0b4668eaddf531291819bd922))
* use active versions only for bench comparisson ([#107](https://github.com/RafaelGSS/bench-node/issues/107)) ([bf119c7](https://github.com/RafaelGSS/bench-node/commit/bf119c783df026ad40b7e26209fc7b2368b6a292))

## [0.10.0](https://github.com/RafaelGSS/bench-node/compare/v0.9.0...v0.10.0) (2025-07-31)


### Features

* Add code coverage to the test code. ([#96](https://github.com/RafaelGSS/bench-node/issues/96)) ([daff350](https://github.com/RafaelGSS/bench-node/commit/daff3509be6731e7415eaa2a8ba0b7464d1b7408))
* add fastest/slowest value for feature parity with benchmark.js ([9ad4c94](https://github.com/RafaelGSS/bench-node/commit/9ad4c9461f105f7681a77f80a2c33eea521ddba6))
* Show bar chart with 2% resolution by using partial width box characters. ([#97](https://github.com/RafaelGSS/bench-node/issues/97)) ([4c65557](https://github.com/RafaelGSS/bench-node/commit/4c65557b6472c8437eba98d4f91b52da8628d614))


### Bug Fixes

* cpus().length is broken under docker. ([#100](https://github.com/RafaelGSS/bench-node/issues/100)) ([c423cdd](https://github.com/RafaelGSS/bench-node/commit/c423cdd0220bc7317861fa387c99a230a34076ee))


### Styles

* Blue works better on light terminals and still looks good on dark. ([#95](https://github.com/RafaelGSS/bench-node/issues/95)) ([5ec0319](https://github.com/RafaelGSS/bench-node/commit/5ec0319787c08ff69ecd54c8003c715e96eafdc7))


### Miscellaneous Chores

* do not stop machine on runner_warmer ([6e0e71d](https://github.com/RafaelGSS/bench-node/commit/6e0e71dd30e4eb3bb5a1902a9eb9e6050bbccef7))
* run lint:ci on test ([#103](https://github.com/RafaelGSS/bench-node/issues/103)) ([a85e15c](https://github.com/RafaelGSS/bench-node/commit/a85e15cfb6b8bbf90a56c28aea49a3ff2e913567))

## [0.9.0](https://github.com/RafaelGSS/bench-node/compare/v0.8.0...v0.9.0) (2025-07-17)


### Features

* add reporterOptions support with printHeader opt ([#92](https://github.com/RafaelGSS/bench-node/issues/92)) ([20d34e9](https://github.com/RafaelGSS/bench-node/commit/20d34e90340d179ea20958f760f732f7e1573551))

## [0.8.0](https://github.com/RafaelGSS/bench-node/compare/v0.7.0...v0.8.0) (2025-07-16)


### Features

* add baseline and summary to pretty and text reporter ([#83](https://github.com/RafaelGSS/bench-node/issues/83)) ([3aa57cb](https://github.com/RafaelGSS/bench-node/commit/3aa57cb1e487274b141ab79a99e7ed0718cdbf63))
* add pretty-reporter and shorthand pretty: true ([#82](https://github.com/RafaelGSS/bench-node/issues/82)) ([45efe9c](https://github.com/RafaelGSS/bench-node/commit/45efe9c833cc39e7d8abfd203fbb05a4e84e9daa))
* export bench-node ts types ([#77](https://github.com/RafaelGSS/bench-node/issues/77)) ([d93f111](https://github.com/RafaelGSS/bench-node/commit/d93f111472515ff19b0fbe57bce588fdc51cfc9d))


### Bug Fixes

* fix imports in type test file ([#87](https://github.com/RafaelGSS/bench-node/issues/87)) ([defa158](https://github.com/RafaelGSS/bench-node/commit/defa158ffadceb6b8c660a802445eafe33933db5))
* use self-hosted runner for test CI ([#81](https://github.com/RafaelGSS/bench-node/issues/81)) ([a65af10](https://github.com/RafaelGSS/bench-node/commit/a65af107859946808ac8458d7b15bb9c887b12da))


### Miscellaneous Chores

* drop Node.js v23 and add v24 ([#78](https://github.com/RafaelGSS/bench-node/issues/78)) ([c2dae5f](https://github.com/RafaelGSS/bench-node/commit/c2dae5f038e3ec613aaac753091fbff5ed927b3f))

## [0.7.0](https://github.com/RafaelGSS/bench-node/compare/v0.6.0...v0.7.0) (2025-05-15)


### Features

* add opsSecPerRun result ([#74](https://github.com/RafaelGSS/bench-node/issues/74)) ([34ad9e9](https://github.com/RafaelGSS/bench-node/commit/34ad9e95b23d92d80442955569f04efdafc97655))

## [0.6.0](https://github.com/RafaelGSS/bench-node/compare/v0.5.4...v0.6.0) (2025-04-30)


### Features

* add time mode benchmark ([#71](https://github.com/RafaelGSS/bench-node/issues/71)) ([9d72044](https://github.com/RafaelGSS/bench-node/commit/9d72044a13a9fd93ae5f1b97fc26ff4a7db7d5f1))


### Documentation

* add JSDoc to functions ([#69](https://github.com/RafaelGSS/bench-node/issues/69)) ([e5c6695](https://github.com/RafaelGSS/bench-node/commit/e5c66957ec737f1a8f5ecc4f204e8032daf50aca))


### Miscellaneous Chores

* start issuing semver-minor ([3a261ae](https://github.com/RafaelGSS/bench-node/commit/3a261ae94ea029e8aed68153968570eb7c38a2c1))

## [0.5.4](https://github.com/RafaelGSS/bench-node/compare/v0.5.3...v0.5.4) (2025-03-13)


### Features

* expose histogram sample data to reporters via sampleData property ([#67](https://github.com/RafaelGSS/bench-node/issues/67)) ([833bec1](https://github.com/RafaelGSS/bench-node/commit/833bec16ae8167785e148ec939fc6211a0662822))

## [0.5.3](https://github.com/RafaelGSS/bench-node/compare/v0.5.2...v0.5.3) (2025-02-24)


### Features

* add min samples as param  ([#65](https://github.com/RafaelGSS/bench-node/issues/65)) ([9c6812e](https://github.com/RafaelGSS/bench-node/commit/9c6812e1124f44d95f8d086cba01b5302ec5187e))


### Miscellaneous Chores

* **readme:** clean + update ([#61](https://github.com/RafaelGSS/bench-node/issues/61)) ([b5e1e8b](https://github.com/RafaelGSS/bench-node/commit/b5e1e8bb507b9f8b017a91e8c814fb1046908042))

## [0.5.2](https://github.com/RafaelGSS/bench-node/compare/v0.5.1...v0.5.2) (2025-01-27)


### Features

* **chartReport:** include node-v ([#53](https://github.com/RafaelGSS/bench-node/issues/53)) ([695842e](https://github.com/RafaelGSS/bench-node/commit/695842eb58c8b6106598a4cef26fe44a552065c6))
* improve htmlReport UX ([#60](https://github.com/RafaelGSS/bench-node/issues/60)) ([79ce533](https://github.com/RafaelGSS/bench-node/commit/79ce5335e95d531b90c4e26fde983ec1c6de9502))


### Documentation

* **readme:** add badges and links ([f85f809](https://github.com/RafaelGSS/bench-node/commit/f85f809aa0f85987d3b01ef9737ed0a855e46741))


### Miscellaneous Chores

* **"branding":** add logo ([#58](https://github.com/RafaelGSS/bench-node/issues/58)) ([3eedd06](https://github.com/RafaelGSS/bench-node/commit/3eedd064791f5804810545db247a509aea618234))

## [0.5.1](https://github.com/RafaelGSS/bench-node/compare/v0.5.0...v0.5.1) (2025-01-19)


### Features

* create csv reporter ([#38](https://github.com/RafaelGSS/bench-node/issues/38)) ([11be8e5](https://github.com/RafaelGSS/bench-node/commit/11be8e52e8cbb5e17f378a8462dd1c4bf7b35351))
* **reporter:** polish chart output ([#40](https://github.com/RafaelGSS/bench-node/issues/40)) ([91082b6](https://github.com/RafaelGSS/bench-node/commit/91082b6441cfa6ba7b195d7386d493d689e29454))
* use biome linter ([#34](https://github.com/RafaelGSS/bench-node/issues/34)) ([11c1108](https://github.com/RafaelGSS/bench-node/commit/11c11088e12d2b77547389eb0a5055ad3ff11427))


### Bug Fixes

* ignore package.json due to release-please ([7c95b0a](https://github.com/RafaelGSS/bench-node/commit/7c95b0a4fd41aa81576503ac9444a775ed498eda))
* lint package.json ([549f6ca](https://github.com/RafaelGSS/bench-node/commit/549f6ca574f4a30915e86dff9cd073b3d90def1e))


### Miscellaneous Chores

* **main:** release 0.5.1 ([#44](https://github.com/RafaelGSS/bench-node/issues/44)) ([4e51324](https://github.com/RafaelGSS/bench-node/commit/4e51324ea129c3607229aaec3b8d22ef221d0e7d))
* **main:** release 0.5.2 ([#45](https://github.com/RafaelGSS/bench-node/issues/45)) ([baf2014](https://github.com/RafaelGSS/bench-node/commit/baf20147c1f09f3e50491845e536c590db0d8aa5))
* **main:** release 0.5.3 ([4757182](https://github.com/RafaelGSS/bench-node/commit/4757182c015cfbd769ebf3969c8269120271e5b3))


### Tests

* add managed basic tests ([#36](https://github.com/RafaelGSS/bench-node/issues/36)) ([c491a32](https://github.com/RafaelGSS/bench-node/commit/c491a328329bc79b2ef8124856b162c8df0e8cfb))


### Continuous Integration

* **release:** add support to release via release-please ([#42](https://github.com/RafaelGSS/bench-node/issues/42)) ([5263cc6](https://github.com/RafaelGSS/bench-node/commit/5263cc68a5c854a260b68e1f5b930496153ac7fb))

## [0.5.3](https://github.com/RafaelGSS/bench-node/compare/v0.5.2...v0.5.3) (2025-01-16)


### Features

* add benchmark repetition ([#27](https://github.com/RafaelGSS/bench-node/issues/27)) ([d65e8aa](https://github.com/RafaelGSS/bench-node/commit/d65e8aab609b882a32331a48bb60fb81ee2db24a))
* add enough context to plugin methods to figure out bench task name ([c16cf34](https://github.com/RafaelGSS/bench-node/commit/c16cf340699cf198ca10146f30c158697afff908))
* add html reporter ([a69fdfb](https://github.com/RafaelGSS/bench-node/commit/a69fdfb7415eeb4645e7116be125ccf876d00ebc))
* add JSONReporter ([7b51c16](https://github.com/RafaelGSS/bench-node/commit/7b51c16db1446b4a2c921c2548e14462197f4779))
* code and examples ([#1](https://github.com/RafaelGSS/bench-node/issues/1)) ([503b573](https://github.com/RafaelGSS/bench-node/commit/503b573a67cf9245383da949274b30412c366084))
* create csv reporter ([#38](https://github.com/RafaelGSS/bench-node/issues/38)) ([11be8e5](https://github.com/RafaelGSS/bench-node/commit/11be8e52e8cbb5e17f378a8462dd1c4bf7b35351))
* **enrichers:** added V8NeverOptimizeEnricher and V8OptimizeOnNextCallEnricher ([16e842e](https://github.com/RafaelGSS/bench-node/commit/16e842eb5dad9703fd009979f68b4f71c98436b2))
* initial commit ([ee2d46f](https://github.com/RafaelGSS/bench-node/commit/ee2d46fc446a481c7bca731639759e4b7529c405))
* **memory-enricher:** added support to report memory heap statistics ([441b3ad](https://github.com/RafaelGSS/bench-node/commit/441b3adfee5d92cdd32cb0d4bfd5e7b49d14c2af))
* **reporter:** polish chart output ([#40](https://github.com/RafaelGSS/bench-node/issues/40)) ([91082b6](https://github.com/RafaelGSS/bench-node/commit/91082b6441cfa6ba7b195d7386d493d689e29454))
* use biome linter ([#34](https://github.com/RafaelGSS/bench-node/issues/34)) ([11c1108](https://github.com/RafaelGSS/bench-node/commit/11c11088e12d2b77547389eb0a5055ad3ff11427))


### Bug Fixes

* handle htmlReport when bench suite is uppercase ([1685144](https://github.com/RafaelGSS/bench-node/commit/16851442e3fe3a97f8e6fc5c98993c77162dc4bc))
* **lifecycle:** missing imports ([08c6064](https://github.com/RafaelGSS/bench-node/commit/08c60646736ee1236cb371143594e337b1d5f502))
* typo ([d2a36ae](https://github.com/RafaelGSS/bench-node/commit/d2a36aec5dae24b9a4e95e4f055109a73d3b6bbc))


### Miscellaneous Chores

* add exec permission to run.sh ([5d0f4ef](https://github.com/RafaelGSS/bench-node/commit/5d0f4ef72849189472b6700ddf7e56376eea61a2))
* add node_modules to ignore ([478f24c](https://github.com/RafaelGSS/bench-node/commit/478f24c3fb8cd896e28e1c87e3212269fe9e31eb))
* **examples:** added example benchmarks ([b4b50b2](https://github.com/RafaelGSS/bench-node/commit/b4b50b23def45698c854bf3bbe434d3f3a92567d))
* **gitignore:** ignore .idea folder ([e9a13ae](https://github.com/RafaelGSS/bench-node/commit/e9a13ae640fd2ec2d7e714c0c6c9240f4ab1c628))
* **main:** release 0.5.1 ([#44](https://github.com/RafaelGSS/bench-node/issues/44)) ([4e51324](https://github.com/RafaelGSS/bench-node/commit/4e51324ea129c3607229aaec3b8d22ef221d0e7d))
* **main:** release 0.5.2 ([#45](https://github.com/RafaelGSS/bench-node/issues/45)) ([baf2014](https://github.com/RafaelGSS/bench-node/commit/baf20147c1f09f3e50491845e536c590db0d8aa5))
* rename to bench-node ([2f15705](https://github.com/RafaelGSS/bench-node/commit/2f157051e3b1988ac3a8094e0fc7e4daee267a48))
* rename to nodebenchmark ([9806a31](https://github.com/RafaelGSS/bench-node/commit/9806a31c819073d705bd59c29adc35e808e61d6c))
* **run:** added script to run all examples ([6733730](https://github.com/RafaelGSS/bench-node/commit/6733730de9fa83a0b6ee7f243b1c3c0576f6f4ad))
* update rafaelgss email ([a5ec544](https://github.com/RafaelGSS/bench-node/commit/a5ec5445a777c9db12181cae70cd47def0ac56c2))


### Code Refactoring

* **lib:** from esm to commonjs ([f25d0e4](https://github.com/RafaelGSS/bench-node/commit/f25d0e40c293a07fe865f09f9bd6693b3152e5b0))
* **lib:** make the code usable outside/inside node core ([c60c80e](https://github.com/RafaelGSS/bench-node/commit/c60c80e8fd6cad52f5275419252e313e03767893))
* **validators:** added missing validators on clock ([478fc7e](https://github.com/RafaelGSS/bench-node/commit/478fc7e3456c84797cd718b2c7eeb7e876bad2bc))


### Tests

* add a test documenting the plugin signature and lifecycle ([fd379d6](https://github.com/RafaelGSS/bench-node/commit/fd379d6ed51317504255eb78a24e33db21e0b3a7))
* add basic test suite ([8349ee0](https://github.com/RafaelGSS/bench-node/commit/8349ee0f96236646776fd12843c01d1d9c806b42))
* add managed basic tests ([#36](https://github.com/RafaelGSS/bench-node/issues/36)) ([c491a32](https://github.com/RafaelGSS/bench-node/commit/c491a328329bc79b2ef8124856b162c8df0e8cfb))
* add scenario for optimized managed benchmark ([74c4db1](https://github.com/RafaelGSS/bench-node/commit/74c4db1046857f9af57c0c54cc5bf801d0195339))
* add test case for copy function ([ddf6dc7](https://github.com/RafaelGSS/bench-node/commit/ddf6dc7b4e7a695f6bff5766788b4b0d5beec527))
* fix the plugin api test ([be8ec69](https://github.com/RafaelGSS/bench-node/commit/be8ec69ff9481ce55b8e49f5732e01a468f6b5de))
* include TODO test for managed and async ([15ff469](https://github.com/RafaelGSS/bench-node/commit/15ff46924bb969d724d1f92f5611a3f4385f0d47))
* increase percentage diff on CI ([fa57188](https://github.com/RafaelGSS/bench-node/commit/fa571883f30fd7033a12e05f291fe12bf4816152))


### Build System

* move run.sh to examples folder ([08ac769](https://github.com/RafaelGSS/bench-node/commit/08ac7699032a32f3a04a252cc48ee1514fd734bd))


### Continuous Integration

* **release:** add support to release via release-please ([#42](https://github.com/RafaelGSS/bench-node/issues/42)) ([5263cc6](https://github.com/RafaelGSS/bench-node/commit/5263cc68a5c854a260b68e1f5b930496153ac7fb))

## [0.5.2](https://github.com/RafaelGSS/bench-node/compare/v0.5.1...v0.5.2) (2025-01-16)


### Features

* add benchmark repetition ([#27](https://github.com/RafaelGSS/bench-node/issues/27)) ([d65e8aa](https://github.com/RafaelGSS/bench-node/commit/d65e8aab609b882a32331a48bb60fb81ee2db24a))
* add enough context to plugin methods to figure out bench task name ([c16cf34](https://github.com/RafaelGSS/bench-node/commit/c16cf340699cf198ca10146f30c158697afff908))
* add html reporter ([a69fdfb](https://github.com/RafaelGSS/bench-node/commit/a69fdfb7415eeb4645e7116be125ccf876d00ebc))
* add JSONReporter ([7b51c16](https://github.com/RafaelGSS/bench-node/commit/7b51c16db1446b4a2c921c2548e14462197f4779))
* code and examples ([#1](https://github.com/RafaelGSS/bench-node/issues/1)) ([503b573](https://github.com/RafaelGSS/bench-node/commit/503b573a67cf9245383da949274b30412c366084))
* create csv reporter ([#38](https://github.com/RafaelGSS/bench-node/issues/38)) ([11be8e5](https://github.com/RafaelGSS/bench-node/commit/11be8e52e8cbb5e17f378a8462dd1c4bf7b35351))
* **enrichers:** added V8NeverOptimizeEnricher and V8OptimizeOnNextCallEnricher ([16e842e](https://github.com/RafaelGSS/bench-node/commit/16e842eb5dad9703fd009979f68b4f71c98436b2))
* initial commit ([ee2d46f](https://github.com/RafaelGSS/bench-node/commit/ee2d46fc446a481c7bca731639759e4b7529c405))
* **memory-enricher:** added support to report memory heap statistics ([441b3ad](https://github.com/RafaelGSS/bench-node/commit/441b3adfee5d92cdd32cb0d4bfd5e7b49d14c2af))
* **reporter:** polish chart output ([#40](https://github.com/RafaelGSS/bench-node/issues/40)) ([91082b6](https://github.com/RafaelGSS/bench-node/commit/91082b6441cfa6ba7b195d7386d493d689e29454))
* use biome linter ([#34](https://github.com/RafaelGSS/bench-node/issues/34)) ([11c1108](https://github.com/RafaelGSS/bench-node/commit/11c11088e12d2b77547389eb0a5055ad3ff11427))


### Bug Fixes

* handle htmlReport when bench suite is uppercase ([1685144](https://github.com/RafaelGSS/bench-node/commit/16851442e3fe3a97f8e6fc5c98993c77162dc4bc))
* **lifecycle:** missing imports ([08c6064](https://github.com/RafaelGSS/bench-node/commit/08c60646736ee1236cb371143594e337b1d5f502))
* typo ([d2a36ae](https://github.com/RafaelGSS/bench-node/commit/d2a36aec5dae24b9a4e95e4f055109a73d3b6bbc))


### Miscellaneous Chores

* add exec permission to run.sh ([5d0f4ef](https://github.com/RafaelGSS/bench-node/commit/5d0f4ef72849189472b6700ddf7e56376eea61a2))
* add node_modules to ignore ([478f24c](https://github.com/RafaelGSS/bench-node/commit/478f24c3fb8cd896e28e1c87e3212269fe9e31eb))
* **examples:** added example benchmarks ([b4b50b2](https://github.com/RafaelGSS/bench-node/commit/b4b50b23def45698c854bf3bbe434d3f3a92567d))
* **gitignore:** ignore .idea folder ([e9a13ae](https://github.com/RafaelGSS/bench-node/commit/e9a13ae640fd2ec2d7e714c0c6c9240f4ab1c628))
* **main:** release 0.5.1 ([#44](https://github.com/RafaelGSS/bench-node/issues/44)) ([4e51324](https://github.com/RafaelGSS/bench-node/commit/4e51324ea129c3607229aaec3b8d22ef221d0e7d))
* rename to bench-node ([2f15705](https://github.com/RafaelGSS/bench-node/commit/2f157051e3b1988ac3a8094e0fc7e4daee267a48))
* rename to nodebenchmark ([9806a31](https://github.com/RafaelGSS/bench-node/commit/9806a31c819073d705bd59c29adc35e808e61d6c))
* **run:** added script to run all examples ([6733730](https://github.com/RafaelGSS/bench-node/commit/6733730de9fa83a0b6ee7f243b1c3c0576f6f4ad))
* update rafaelgss email ([a5ec544](https://github.com/RafaelGSS/bench-node/commit/a5ec5445a777c9db12181cae70cd47def0ac56c2))


### Code Refactoring

* **lib:** from esm to commonjs ([f25d0e4](https://github.com/RafaelGSS/bench-node/commit/f25d0e40c293a07fe865f09f9bd6693b3152e5b0))
* **lib:** make the code usable outside/inside node core ([c60c80e](https://github.com/RafaelGSS/bench-node/commit/c60c80e8fd6cad52f5275419252e313e03767893))
* **validators:** added missing validators on clock ([478fc7e](https://github.com/RafaelGSS/bench-node/commit/478fc7e3456c84797cd718b2c7eeb7e876bad2bc))


### Tests

* add a test documenting the plugin signature and lifecycle ([fd379d6](https://github.com/RafaelGSS/bench-node/commit/fd379d6ed51317504255eb78a24e33db21e0b3a7))
* add basic test suite ([8349ee0](https://github.com/RafaelGSS/bench-node/commit/8349ee0f96236646776fd12843c01d1d9c806b42))
* add managed basic tests ([#36](https://github.com/RafaelGSS/bench-node/issues/36)) ([c491a32](https://github.com/RafaelGSS/bench-node/commit/c491a328329bc79b2ef8124856b162c8df0e8cfb))
* add scenario for optimized managed benchmark ([74c4db1](https://github.com/RafaelGSS/bench-node/commit/74c4db1046857f9af57c0c54cc5bf801d0195339))
* add test case for copy function ([ddf6dc7](https://github.com/RafaelGSS/bench-node/commit/ddf6dc7b4e7a695f6bff5766788b4b0d5beec527))
* fix the plugin api test ([be8ec69](https://github.com/RafaelGSS/bench-node/commit/be8ec69ff9481ce55b8e49f5732e01a468f6b5de))
* include TODO test for managed and async ([15ff469](https://github.com/RafaelGSS/bench-node/commit/15ff46924bb969d724d1f92f5611a3f4385f0d47))
* increase percentage diff on CI ([fa57188](https://github.com/RafaelGSS/bench-node/commit/fa571883f30fd7033a12e05f291fe12bf4816152))


### Build System

* move run.sh to examples folder ([08ac769](https://github.com/RafaelGSS/bench-node/commit/08ac7699032a32f3a04a252cc48ee1514fd734bd))


### Continuous Integration

* **release:** add support to release via release-please ([#42](https://github.com/RafaelGSS/bench-node/issues/42)) ([5263cc6](https://github.com/RafaelGSS/bench-node/commit/5263cc68a5c854a260b68e1f5b930496153ac7fb))

## [0.5.1](https://github.com/RafaelGSS/bench-node/compare/v0.5.0...v0.5.1) (2025-01-14)


### Features

* create csv reporter ([#38](https://github.com/RafaelGSS/bench-node/issues/38)) ([11be8e5](https://github.com/RafaelGSS/bench-node/commit/11be8e52e8cbb5e17f378a8462dd1c4bf7b35351))
* **reporter:** polish chart output ([#40](https://github.com/RafaelGSS/bench-node/issues/40)) ([91082b6](https://github.com/RafaelGSS/bench-node/commit/91082b6441cfa6ba7b195d7386d493d689e29454))
* use biome linter ([#34](https://github.com/RafaelGSS/bench-node/issues/34)) ([11c1108](https://github.com/RafaelGSS/bench-node/commit/11c11088e12d2b77547389eb0a5055ad3ff11427))


### Tests

* add managed basic tests ([#36](https://github.com/RafaelGSS/bench-node/issues/36)) ([c491a32](https://github.com/RafaelGSS/bench-node/commit/c491a328329bc79b2ef8124856b162c8df0e8cfb))


### Continuous Integration

* **release:** add support to release via release-please ([#42](https://github.com/RafaelGSS/bench-node/issues/42)) ([5263cc6](https://github.com/RafaelGSS/bench-node/commit/5263cc68a5c854a260b68e1f5b930496153ac7fb))

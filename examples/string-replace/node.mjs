import { Suite } from '../../lib/index.mjs';

const suite = new Suite();

const pattern = /[123]/g
const replacements = { 1: 'a', 2: 'b', 3: 'c' }

const subject = '123123123123123123123123123123123123123123123123'

suite
  .add('single with matcher', function () {
    const r = subject.replace(pattern, m => replacements[m])
  })
  .add('multiple replaces', function () {
    const r = subject.replace(/1/g, 'a').replace(/2/g, 'b').replace(/3/g, 'c')
  })
  .run()

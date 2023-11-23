import { Suite } from '../../lib/index.mjs';

const suite = new Suite();

const text = 'text/html,application/xhtml+xml,application/xml;application/json;q=0.9,image/avif,image/webp,*/*;q=0.8'
const regex = /application\/json/

suite
  .add('Using includes', function () {
    const r = text.includes('application/json')
  })
  .add('Using indexof', function () {
    const r = text.indexOf('application/json') !== -1
  })
  .add('Using cached RegExp.test', function () {
    const r = regex.test(text)
  })
  .run();

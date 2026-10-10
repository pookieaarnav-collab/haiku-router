import { expect, test } from 'claude-code/testing'
import { classify } from './classify'

test('simple short questions go to the cheap model', () => {
  expect(classify('what is the flag for a recursive copy?', 2).cheap).toBe(true)
  expect(classify('translate "good morning" to Spanish', 0).cheap).toBe(true)
  expect(classify('define idempotent', 0).cheap).toBe(true)
})

test('complex or long work stays on the main model', () => {
  expect(classify('refactor the auth module to use sessions', 0).cheap).toBe(false)
  expect(classify('what is wrong here?\n```js\nfoo()\n```', 0).cheap).toBe(false)
  expect(classify('what is ' + 'x'.repeat(400), 0).cheap).toBe(false)
  expect(classify('/compact', 0).cheap).toBe(false)
  expect(classify('', 0).cheap).toBe(false)
})

test('a long conversation is not rerouted', () => {
  expect(classify('what is a mutex?', 40).cheap).toBe(false)
})

import { expect, test } from 'claude-code/testing'

const SONNET = 'claude-sonnet-5-5'
const HAIKU = 'claude-haiku-4-5-20251001'

async function modelSentFor($: any, on: any, text: string, turnId: string) {
  let sent = ''
  on('session.messages', async () => ({ value: [] }))
  on('turn.start', async (_$: any, e: any) => ({ turnId: e.turnId }))
  on('turn.step', async function* (_$: any, e: any) {
    sent = e.model
    return { turnId: e.turnId, index: e.index, answer: '', toolUses: [], stopReason: 'end_turn', usage: null }
  })
  await $.turn.start({ text, turnId })
  const stream = $.turn.step({ turnId, index: 0, model: SONNET, messageCount: 2 })
  for await (const _ of stream) { /* drain */ }
  return sent
}

test('a simple prompt is sent to Haiku', async ($, on) => {
  expect(await modelSentFor($, on, 'what is a mutex?', 't1')).toBe(HAIKU)
})

test('a complex prompt keeps the session model', async ($, on) => {
  expect(await modelSentFor($, on, 'refactor the payment service', 't2')).toBe(SONNET)
})

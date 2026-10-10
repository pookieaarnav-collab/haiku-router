import type { Register } from 'claude-code'
import { CHEAP_MODEL, classify } from './classify'

export const register: Register = on => {
  // turnId -> true when that whole turn runs on the cheap model.
  // One decision per turn, so a turn never changes model halfway through.
  const cheapTurns = new Map<string, boolean>()
  let isEnabled = true

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'haiku-router',
      description: 'Turn automatic routing of simple prompts to Haiku on or off',
    })
    return next(e)
  })

  on('command.run', { command: 'haiku-router' }, async $ => {
    isEnabled = !isEnabled
    if (!isEnabled) $.ui.status(undefined)
    return { text: `haiku-router is ${isEnabled ? 'on' : 'off'}.` }
  })

  on('turn.start', async ($, e, next) => {
    if (isEnabled) {
      // The turn is not running yet, so count the messages so far.
      const messages = await $.session.messages()
      const verdict = classify(e.text, Array.isArray(messages) ? messages.length : 0)
      cheapTurns.set(e.turnId, verdict.cheap)
    }
    return next(e)
  })

  on('turn.step', async function* ($, e, next) {
    // Main thread only. Subagents keep whatever model they were given.
    const isCheap = e.agentId === undefined && cheapTurns.get(e.turnId) === true
    if (!isEnabled || !isCheap || e.model === CHEAP_MODEL) {
      return yield* next(e)
    }
    $.ui.status('haiku-router: this turn runs on Haiku')
    return yield* next({ ...e, model: CHEAP_MODEL })
  })

  on('turn.complete', async ($, e, next) => {
    cheapTurns.delete(e.turnId)
    $.ui.status(undefined)
    return next(e)
  })
}

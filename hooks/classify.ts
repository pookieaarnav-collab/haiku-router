// Decides whether a prompt is simple enough for the cheap model.
// Pure function so it can be tested without the engine.

export const CHEAP_MODEL = 'claude-haiku-4-5-20251001'

// Longer prompts are rarely simple.
export const MAX_CHARS = 280
// A long conversation carries a large cached prefix on the current model.
// Switching models drops that cache, so only reroute early in a conversation.
export const MAX_CONTEXT_MESSAGES = 12

const HARD =
  /\b(refactor|implement|build|architect|architecture|design|debug|investigate|migrate|optimi[sz]e|review|audit|research|analy[sz]e|plan|prove|benchmark|security|across|entire|whole|all files|codebase|repo|repository|multi[- ]?step|step[- ]by[- ]step|in depth|thorough|deep dive)\b/i

const SIMPLE =
  /^(what('s| is| are| does)|who|when|where|define|meaning of|how do you (say|spell)|translate|convert|spell|fix (the )?typo|rename|reformat|capitali[sz]e|summari[sz]e (this|in one)|tl;?dr|rewrite (this )?(in|as|to)|list|give me (a|an|the) (word|synonym|example|one-liner|command)|which (command|flag)|what('s| is) the (command|flag|syntax))\b/i

export type Verdict = { cheap: boolean; why: string }

export function classify(text: string, messageCount: number): Verdict {
  const t = text.trim()
  if (t === '') return { cheap: false, why: 'empty prompt' }
  if (t.startsWith('/')) return { cheap: false, why: 'slash command' }
  if (t.length > MAX_CHARS) return { cheap: false, why: 'long prompt' }
  if (t.includes('```')) return { cheap: false, why: 'contains code block' }
  if (t.split('\n').length > 3) return { cheap: false, why: 'multi-line prompt' }
  if (HARD.test(t)) return { cheap: false, why: 'complex task wording' }
  if (messageCount > MAX_CONTEXT_MESSAGES)
    return { cheap: false, why: 'long conversation, cache is warm' }
  if (!SIMPLE.test(t)) return { cheap: false, why: 'not a known simple pattern' }
  return { cheap: true, why: 'short, simple request' }
}

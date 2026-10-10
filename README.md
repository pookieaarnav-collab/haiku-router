# haiku-router

A Claude Code mod that sends short, simple prompts to Haiku and keeps everything else on the model you picked.

## Install

Type this at the prompt of a terminal Claude Code session:

```
/plugin install haiku-router --marketplace pookieaarnav-collab/haiku-router
```

Answer `y` to add the marketplace, then choose the user scope so it loads in every session.

## How it works

A prompt goes to Haiku only if it is 280 characters or fewer, has no code block, is at most 3 lines, and opens like a plain lookup ("what is", "define", "translate", "rename"). Words like refactor, implement, debug, plan and review keep it on your main model. It only reroutes in the first 12 messages of a conversation, because switching models drops the cached conversation.

The decision is made once per turn. Subagents are not touched. `/haiku-router` turns routing on or off.

Edit the patterns and limits at the top of `hooks/classify.ts`.

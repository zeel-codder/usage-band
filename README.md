# usage-band

A Claude Code plugin that draws a small band above the prompt: the tokens and estimated cost of the
current chat, and bars for your rate-limit windows.

```
chat 12.4k in · 38.1k out · 2.1M cache · $1.23
5h   ██████░░░░░░ 50% resets 2h 14m
7d   ███░░░░░░░░░ 25% resets 3d 6h
```

## Install

At the prompt of a terminal session:

```
/plugin install usage-band --marketplace zeel-codder/usage-band
```

Answer `y` to add the marketplace, then choose a scope.

## What it shows

- **Tokens:** input, output and prompt-cache tokens since the plugin loaded, subagents included. They
  reset on `/clear`.
- **Cost:** the session's estimated cost, as `/cost` totals it. On a subscription this is not what you
  are billed.
- **Limits:** the windows Claude Code reports: 5 hours and 7 days. They turn yellow at 70% and red at
  90%, appear after the first reply, and only on a subscription. There is no daily window to show.

The plugin makes no model or network calls of its own, so it uses none of your limits.

## Development

```
claude plugin validate .
claude plugin test .
```

# usage-band

A Claude Code plugin that draws a small band above the prompt: the tokens and estimated cost of the
current chat, and bars for your rate-limit windows.

![The usage band as the context window fills from 0 to 100 percent](assets/preview.svg)

The animation uses sample numbers and goes from 0% to 100% context in about 26 seconds. In a terminal the
band is drawn with text blocks, so it follows your font and theme.

## The creature

| Context used | Mood | Animation | Colour |
| --- | --- | --- | --- |
| 0% | Asleep | A `z` grows to `Z` | Grey |
| Under 50% | Happy | Bounces | Green |
| 50–69% | Uneasy | Blinks | Blue |
| 70–84% | Angry | Shakes | Yellow |
| 85% and up | Furious | Shakes harder, with steam | Red |

```
           z
▄██████▄   ▄██████▄   ▄██████▄   ▄██████▄   ~  ~
█▄▄██▄▄█   █ ████ █   █ ████ █   █▀▄██▄▀█   ▄██████▄
▀██████▀   ▀█▄▄▄▄█▀   ▀██▄▄██▀   ▀█▀▄▄▀█▀   █▀▄██▄▀█
                                            ▀█▀▄▄▀█▀
 asleep     happy      uneasy     angry      furious
```

## Install

At the prompt of a terminal session:

```
/plugin install usage-band --marketplace zeel-codder/usage-band
```

Answer `y` to add the marketplace, then choose a scope.

## What it shows

- **Creature:** an animated pixel blob that shows how full the context window is: asleep when empty,
  bouncing under 50%, uneasy under 70%, shaking with anger under 85%, and steaming above that.
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

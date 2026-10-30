import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Limit, Measure, Tokens } from '../types'
import { MOOD_COLOR, moodOf, sprite } from './sprite'

const NO_TOKENS: Tokens = { input: 0, output: 0, cached: 0 }
const NO_MEASURE: Measure = { limits: [] }
const BAR_CELLS = 12
const FRAME_MS = 800

const tokens = atom({ plugin: 'usage-band', key: 'tokens' } as const, NO_TOKENS)
const measure = atom({ plugin: 'usage-band', key: 'measure' } as const, NO_MEASURE)
const frame = atom({ plugin: 'usage-band', key: 'frame' } as const, 0)

const LABELS: Record<string, string> = {
  five_hour: '5h',
  seven_day: '7d',
  spend_limit: 'spend',
}

const count = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

const bar = (percent: number): string => {
  const filled = Math.round((Math.min(percent, 100) / 100) * BAR_CELLS)
  return '█'.repeat(filled) + '░'.repeat(BAR_CELLS - filled)
}

const barColor = (percent: number) =>
  percent >= 90 ? 'error' : percent >= 70 ? 'warning' : 'success'

const untilReset = (resetsAt: string | undefined, now: number): string => {
  const at = resetsAt ? Date.parse(resetsAt) : NaN
  if (Number.isNaN(at) || at <= now) return ''
  const minutes = Math.ceil((at - now) / 60_000)
  if (minutes < 60) return `resets ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `resets ${hours}h ${minutes % 60}m`
  return `resets ${Math.floor(hours / 24)}d ${hours % 24}h`
}

type Reading = {
  cost?: { usd: number }
  rateLimits: readonly Limit[]
  context: { percent?: number }
}

const toMeasure = ({ cost, rateLimits, context }: Reading): Measure => ({
  usd: cost?.usd,
  contextPercent: context.percent,
  limits: rateLimits.map(({ kind, percentUsed, resetsAt }) => ({ kind, percentUsed, resetsAt })),
})

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    const usage = await $.session.usage()
    await update($, measure, () => toMeasure(usage))
    $.clock.every(FRAME_MS, () => update($, frame, f => f + 1))
    return result
  })

  on('session.end', async ($, e, next) => {
    if (e.reason === 'clear') {
      await update($, tokens, () => NO_TOKENS)
    }
    return next(e)
  })

  // Every request counts here, a subagent's too, as the cost ledger counts them.
  on('turn.step', async function* ($, e, next) {
    const response = yield* next(e)
    const used = response.usage
    if (used) {
      await update($, tokens, t => ({
        input: t.input + used.input_tokens,
        output: t.output + used.output_tokens,
        cached: t.cached + used.cache_read_input_tokens + used.cache_creation_input_tokens,
      }))
    }
    return response
  })

  on('session.measure', async ($, e, next) => {
    await update($, measure, () => toMeasure(e))
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) {
      return next(e)
    }

    const t = await read($, tokens)
    const { usd, limits, contextPercent = 0 } = await read($, measure)
    const now = await $.clock.now()
    const mood = moodOf(contextPercent)
    const rows = sprite(mood, await read($, frame))
    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="row">
        <Box flexDirection="column">
          {rows.map((row, i) => (
            <Text key={i} color={MOOD_COLOR[mood]}>
              {row}
            </Text>
          ))}
        </Box>
        <Box flexDirection="column">
          <Text>
            ctx {contextPercent}%<Text dimColor> · chat </Text>
            {count(t.input)} in · {count(t.output)} out · {count(t.cached)} cache
            {usd === undefined ? '' : ` · $${usd.toFixed(2)}`}
          </Text>
          {limits.map(limit => (
            <Text key={limit.kind}>
              <Text dimColor>{(LABELS[limit.kind] ?? limit.kind).padEnd(5)}</Text>
              <Text color={barColor(limit.percentUsed)}>{bar(limit.percentUsed)}</Text>
              {` ${Math.round(limit.percentUsed)}% `}
              <Text dimColor>{untilReset(limit.resetsAt, now)}</Text>
            </Text>
          ))}
        </Box>
      </Box>
    )
  })
}

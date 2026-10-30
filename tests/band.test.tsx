import { expect, test } from 'claude-code/testing'

import { WIDTH, sprite } from '../hooks/sprite'

const BAND = {
  plugin: 'usage-band',
  component: 'AbovePrompt',
  surface: 'terminal',
  props: { hasSurvey: false, isWorking: false, maxRows: 10, scroll: { offset: 0, bodyRows: 10 } },
} as const

test('the creature follows the context window', async ($, on) => {
  on('session.measure', (_, e) => ({ changed: e.changed }))
  on('clock.now', () => ({ value: 0 }))

  const faces = [
    [0, /█▄▄██▄▄█/],
    [30, /▀█▄▄▄▄█▀/],
    [60, /▀██▄▄██▀/],
    [75, /█▀▄██▄▀█/],
    [90, /█▀▄██▄▀█/],
  ] as const

  for (const [percent, face] of faces) {
    await $.session.measure({
      context: { window: 200000, percent },
      rateLimits: [],
      changed: ['context'],
    })
    const ui = await $.ui.mount(BAND as never)
    expect(await ui.find({ type: 'Text', text: face })).toBeTruthy()
    expect((await ui.find({ type: 'Text', text: /ctx/ }))?.text).toContain(`ctx ${percent}%`)
    await ui.unmount()
  }
})

test('every mood moves and keeps its size', () => {
  for (const mood of ['asleep', 'happy', 'angry', 'furious'] as const) {
    expect(sprite(mood, 0)).not.toEqual(sprite(mood, 1))
  }
  expect(sprite('uneasy', 0)).not.toEqual(sprite('uneasy', 3))

  for (const mood of ['asleep', 'happy', 'uneasy', 'angry', 'furious'] as const) {
    for (const frame of [0, 1, 2, 3]) {
      const rows = sprite(mood, frame)
      expect(rows.length).toBe(4)
      for (const row of rows) expect(row.length).toBe(WIDTH)
    }
  }
})

test('the band shows tokens, cost and both limit bars', async ($, on) => {
  on('session.measure', (_, e) => ({ changed: e.changed }))
  on('clock.now', () => ({ value: 0 }))

  await $.session.measure({
    context: { window: 200000 },
    rateLimits: [
      { kind: 'five_hour', percentUsed: 50 },
      { kind: 'seven_day', percentUsed: 25 },
    ],
    cost: { usd: 1.5 },
    changed: ['cost', 'rateLimits'],
  })

  const ui = await $.ui.mount(BAND as never)

  expect((await ui.find({ type: 'Text', text: /\$1\.50/ }))?.text).toContain('0 in')
  expect((await ui.find({ type: 'Text', text: /5h/ }))?.text).toContain('50%')
  expect((await ui.find({ type: 'Text', text: /7d/ }))?.text).toContain('25%')
  await ui.unmount()
})

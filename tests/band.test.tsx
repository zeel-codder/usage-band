import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'usage-band',
  component: 'AbovePrompt',
  surface: 'terminal',
  props: { hasSurvey: false, isWorking: false, maxRows: 10, scroll: { offset: 0, bodyRows: 10 } },
} as const

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

export type Tokens = { input: number; output: number; cached: number }

export type Limit = { kind: string; percentUsed: number; resetsAt?: string }

export type Measure = { usd?: number; limits: Limit[]; contextPercent?: number }

declare module 'claude-code' {
  interface PluginState {
    'usage-band': { tokens: Tokens; measure: Measure; frame: number }
  }
}

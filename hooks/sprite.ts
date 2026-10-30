export type Mood = 'asleep' | 'happy' | 'uneasy' | 'angry' | 'furious'

export const WIDTH = 13

const TOP = '▄██████▄'
const OPEN = '█ ████ █'
const BLINK = '█▄████▄█'
const CLOSED = '█▄▄██▄▄█'
const CROSS = '█▀▄██▄▀█'
const SMILE = '▀█▄▄▄▄█▀'
const FLAT = '▀██▄▄██▀'
const FROWN = '▀█▀▄▄▀█▀'
const REST = '▀██████▀'

export const moodOf = (percent: number): Mood => {
  if (percent <= 0) return 'asleep'
  if (percent < 50) return 'happy'
  if (percent < 70) return 'uneasy'
  if (percent < 85) return 'angry'
  return 'furious'
}

export const MOOD_COLOR: Record<Mood, string> = {
  asleep: 'subtle',
  happy: 'success',
  uneasy: 'suggestion',
  angry: 'warning',
  furious: 'error',
}

// Always four rows, so the band keeps its height whichever frame is showing.
const frameRows = (mood: Mood, frame: number): string[] => {
  const odd = frame % 2 === 1
  switch (mood) {
    case 'asleep':
      return [odd ? '         Z' : '        z', TOP, CLOSED, REST]
    case 'happy':
      return odd ? ['', TOP, OPEN, SMILE] : [TOP, OPEN, SMILE, '']
    case 'uneasy':
      return ['', TOP, frame % 4 === 3 ? BLINK : OPEN, FLAT]
    case 'angry':
      return ['', TOP, CROSS, FROWN].map(row => (row && odd ? ` ${row}` : row))
    case 'furious':
      return [odd ? '  ~  ~' : ' ~  ~', TOP, CROSS, FROWN].map((row, i) =>
        i > 0 && odd ? `  ${row}` : row,
      )
  }
}

export const sprite = (mood: Mood, frame: number): string[] =>
  frameRows(mood, frame).map(row => row.padEnd(WIDTH))

export type SeatStatus = 'ok' | 'failed' | 'disabled'
export type Seat = { name: string; model: string; status: SeatStatus; verdict: string | null; text: string }
export type TribunalRun = {
  focus: string
  base: string
  // What the diff covered, in words: "HEAD (uncommitted changes only)", a merge base, ...
  label: string
  // What the reviewers did not see: a truncated diff, untracked files left out.
  gaps: string[]
  seats: Seat[]
  summary: string
}
export type Claim = { id: string; at: number }

declare module 'claude-code' {
  interface PluginState {
    'inline-tribunal': {
      last: TribunalRun | null
      running: Claim | null
    }
  }
}

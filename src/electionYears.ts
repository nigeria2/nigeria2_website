// Election years we surface results/prediction pages for. 2027 has not been held
// yet, so its results pages render empty ("not held yet").
export const RESULT_YEARS = ['2019', '2023', '2027'] as const
export type ResultYear = (typeof RESULT_YEARS)[number]

// Years with real captured results vs. future elections (empty pages).
export const isFutureElection = (year: string) => Number(year) >= 2027

export const isResultYear = (year: string): year is ResultYear =>
  (RESULT_YEARS as readonly string[]).includes(year)

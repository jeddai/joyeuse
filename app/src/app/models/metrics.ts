export interface Metrics {
  [key: string]: number | {
    [key: string]: number | {
      count: number
    }
  }
}

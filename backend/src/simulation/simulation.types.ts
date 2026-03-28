export interface DrawResult {
  sessionId: string;
  drawNumber: number;
  playerNumbers: number[];
  drawnNumbers: number[];
  hits: number;
  stats: DrawStats;
}

export interface DrawStats {
  totalDraws: number;
  yearsElapsed: number;
  totalCost: number;
  wins: WinCounts;
}

export interface WinCounts {
  two: number;
  three: number;
  four: number;
  five: number;
}

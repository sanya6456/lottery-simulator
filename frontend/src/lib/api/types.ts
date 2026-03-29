export type SessionStatus = "running" | "jackpot" | "expired";

export type Session = {
  id: string;
  status: SessionStatus;
  useRandomNumbers: boolean;
  playerNumbers: number[] | null;
  speedMs: number;
  totalDraws: number;
  startedAt: string;
  endedAt: string | null;
  updatedAt: string;
};

export type WinningDraw = {
  id: string;
  sessionId: string;
  drawNumber: number;
  playerNumbers: number[];
  drawnNumbers: number[];
  hits: 2 | 3 | 4 | 5;
  drawnAt: string;
};

export type CreateSessionDto = {
  useRandomNumbers: boolean;
  playerNumbers?: number[];
  speedMs?: number;
};

export type UpdateSpeedDto = {
  speedMs: number;
};

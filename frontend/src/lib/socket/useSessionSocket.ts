import { useEffect, useState } from "react";
import { socket } from "./socket";

export type DrawResult = {
  sessionId: string;
  drawNumber: number;
  playerNumbers: number[];
  drawnNumbers: number[];
  hits: number;
  stats: DrawStats;
};

export type DrawStats = {
  totalDraws: number;
  yearsElapsed: number;
  totalCost: number;
  wins: WinCounts;
};

export type WinCounts = {
  two: number;
  three: number;
  four: number;
  five: number;
};

export type SessionEndedPayload = {
  reason: "jackpot" | "expired";
  stats: DrawStats;
};

type UseSessionSocketOptions = {
  onDraw?: (result: DrawResult) => void;
  onSessionEnded?: (payload: SessionEndedPayload) => void;
};

const SESSION_JOIN_EVENT = "session:join";
const SESSION_DRAW_RESULT_EVENT = "draw:result";
const SESSION_LEAVE_EVENT = "session:leave";
const SESSION_ENDED_EVENT = "session:ended";

const joinedSessions = new Set<string>();

export function useSessionSocket(
  sessionId: string | null,
  { onDraw, onSessionEnded }: UseSessionSocketOptions = {},
) {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    if (!sessionId) return;

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      setIsConnected(true);
      if (sessionId && !joinedSessions.has(sessionId)) {
        socket.emit(SESSION_JOIN_EVENT, { sessionId });
        joinedSessions.add(sessionId);
      }
    };

    const handleDisconnect = () => setIsConnected(false);

    if (socket.connected && sessionId && !joinedSessions.has(sessionId)) {
      socket.emit(SESSION_JOIN_EVENT, { sessionId });
      joinedSessions.add(sessionId);
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    if (onDraw) {
      socket.off(SESSION_DRAW_RESULT_EVENT, onDraw);
      socket.on(SESSION_DRAW_RESULT_EVENT, onDraw);
    }
    if (onSessionEnded) {
      socket.off(SESSION_ENDED_EVENT, onSessionEnded);
      socket.on(SESSION_ENDED_EVENT, onSessionEnded);
    }

    return () => {
      if (sessionId && joinedSessions.has(sessionId)) {
        socket.emit(SESSION_LEAVE_EVENT, { sessionId });
        joinedSessions.delete(sessionId);
      }

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      if (onDraw) socket.off(SESSION_DRAW_RESULT_EVENT, onDraw);
      if (onSessionEnded) socket.off(SESSION_ENDED_EVENT, onSessionEnded);
    };
  }, [sessionId, onDraw, onSessionEnded]);

  return { isConnected };
}

import { useEffect, useState } from "react";
import { socket } from "./socket";

const joinedSessions = new Set<string>();

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
        socket.emit("session:join", { sessionId });
        joinedSessions.add(sessionId);
      }
    };

    const handleDisconnect = () => setIsConnected(false);

    if (socket.connected && sessionId && !joinedSessions.has(sessionId)) {
      socket.emit("session:join", { sessionId });
      joinedSessions.add(sessionId);
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    if (onDraw) {
      socket.off("draw:result", onDraw);
      socket.on("draw:result", onDraw);
    }
    if (onSessionEnded) {
      socket.off("session:ended", onSessionEnded);
      socket.on("session:ended", onSessionEnded);
    }

    return () => {
      if (sessionId && joinedSessions.has(sessionId)) {
        socket.emit("session:leave", { sessionId });
        joinedSessions.delete(sessionId);
      }

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      if (onDraw) socket.off("draw:result", onDraw);
      if (onSessionEnded) socket.off("session:ended", onSessionEnded);
    };
  }, [sessionId, onDraw, onSessionEnded]);

  return { isConnected };
}

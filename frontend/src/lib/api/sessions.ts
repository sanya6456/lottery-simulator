import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type {
  CreateSessionDto,
  Session,
  UpdateSpeedDto,
  WinningDraw,
} from "./types";

export const sessionKeys = {
  all: ["sessions"] as const,
  detail: (id: string) => ["sessions", id] as const,
  winningDraws: (id: string) => ["sessions", id, "winning-draws"] as const,
};

export function useSession(id: string) {
  return useQuery({
    queryKey: sessionKeys.detail(id),
    queryFn: () => apiClient.get<Session>(`/sessions/${id}`),
  });
}

export function useWinningDraws(id: string) {
  return useQuery({
    queryKey: sessionKeys.winningDraws(id),
    queryFn: () =>
      apiClient.get<WinningDraw[]>(`/sessions/${id}/winning-draws`),
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateSessionDto) =>
      apiClient.post<Session>("/sessions", dto),
    onSuccess: (session: Session) => {
      queryClient.setQueryData(sessionKeys.detail(session.id), session);
    },
  });
}

export function useUpdateSpeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, speedMs }: UpdateSpeedDto & { id: string }) =>
      apiClient.patch<Session>(`/sessions/${id}/speed`, { speedMs }),
    onSuccess: (session: Session) => {
      queryClient.setQueryData(sessionKeys.detail(session.id), session);
    },
  });
}

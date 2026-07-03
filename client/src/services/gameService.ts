import { Game } from "@/types/game";
import apiClient from "./apiClient";

export interface CreateGamePayload {
  opponentId: string;
  preferredColor: "white" | "black" | "random";
  timeControl: {
    type: "bullet" | "blitz" | "rapid" | "classical" | "custom";
    initialSeconds: number;
    incrementSeconds?: number;
  };
}

export interface MakeMovePayload {
  from: string;
  to: string;
  promotion?: string;
  clientTimestamp?: number;
}

export interface ActiveGamesResponse {
  success: boolean;
  games: Game[];
  pagination: {
    page: number;
    limit: number;
    totalGames: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const createGameService = async (
  payload: CreateGamePayload,
): Promise<Game> => {
  const response = await apiClient.post<{ success: boolean; game: Game }>(
    "/game/createGame",
    payload,
  );
  return response.data.game;
};

export const getGameService = async (gameId: string): Promise<Game> => {
  const response = await apiClient.get<{ success: boolean; game: Game }>(
    `/game/getGame/${gameId}`,
  );
  return response.data.game;
};

export const makeMoveService = async (
  gameId: string,
  payload: MakeMovePayload,
): Promise<Game> => {
  const response = await apiClient.post<{ success: boolean; game: Game }>(
    `/game/makeMove/${gameId}`,
    payload,
  );
  return response.data.game;
};

export const getActiveGamesService = async (
  page = 1,
  limit = 20,
): Promise<ActiveGamesResponse> => {
  const response = await apiClient.get<ActiveGamesResponse>(
    "/game/activeGames",
    {
      params: { page, limit },
    },
  );
  return response.data;
};

export const resignGameService = async (gameId: string): Promise<Game> => {
  const response = await apiClient.post<{ success: boolean; game: Game }>(
    `/game/resignGame/${gameId}`,
  );
  return response.data.game;
};

export const offerDrawService = async (gameId: string): Promise<Game> => {
  const response = await apiClient.post<{ success: boolean; game: Game }>(
    `/game/offerDraw/${gameId}`,
  );
  return response.data.game;
};

export const acceptDrawService = async (gameId: string): Promise<Game> => {
  const response = await apiClient.post<{ success: boolean; game: Game }>(
    `/game/acceptDraw/${gameId}`,
  );
  return response.data.game;
};

export const declineDrawService = async (gameId: string): Promise<Game> => {
  const response = await apiClient.post<{ success: boolean; game: Game }>(
    `/game/declineDraw/${gameId}`,
  );
  return response.data.game;
};

export const abortGameService = async (gameId: string): Promise<Game> => {
  const response = await apiClient.post<{ success: boolean; game: Game }>(
    `/game/abort/${gameId}`,
  );
  return response.data.game;
};

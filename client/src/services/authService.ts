import { User } from "@/types/auth";
import apiClient from "./apiClient";
import { GameAnalytics } from "@/types/gameAnalytics";

export const signUpService = async (
  name: string,
  email: string,
  password: string,
): Promise<User> => {
  const response = await apiClient.post("/user/register", {
    username: name,
    email,
    password,
  });

  const user = response.data.user;

  return {
    id: user.id || user._id,
    name: user.username,
    email: user.email,
    rating: user.rating ?? 1200,
    avatar: user.avatar,
    bio: user.bio ?? "",
    location: user.location ?? "",
    createdAt: user.createdAt || new Date().toISOString(),
  };
};

export const loginService = async (
  email: string,
  password: string,
): Promise<User> => {
  const response = await apiClient.post("/user/login", {
    email,
    password,
  });

  const user = response.data.user;

  return {
    id: user.id || user._id,
    name: user.username,
    email: user.email,
    rating: user.rating ?? 1200,
    location: user.location ?? "",
    bio: user.bio ?? "",
    avatar: user.avatar,
    createdAt: user.createdAt || new Date().toISOString(),
  };
};

export const logoutService = async (): Promise<void> => {
  await apiClient.post("/user/logout");
};

export const getMeService = async (): Promise<User> => {
  const response = await apiClient.get("/user/me");

  const user = response.data.user;

  return {
    id: user.id || user._id,
    name: user.username,
    email: user.email,
    location: user.location ?? "",
    bio: user.bio ?? "",
    rating: user.rating ?? 1200,
    avatar: user.avatar,
    createdAt: user.createdAt || new Date().toISOString(),
  };
};

export const googleAuthService = async (token: string): Promise<User> => {
  const response = await apiClient.post("/user/googleAuth", {
    token,
  });

  const user = response.data.user;

  return {
    id: user.id || user._id,
    name: user.username,
    email: user.email,
    location: user.location ?? "",
    bio: user.bio ?? "",
    rating: user.rating ?? 1200,
    avatar: user.avatar,
    createdAt: user.createdAt || new Date().toISOString(),
  };
};

export const getAnalyticsService = async (): Promise<GameAnalytics> => {
  const response = await apiClient.get("/game/me/analytics");
  return response.data.analytics;
};

export const forgotPasswordService = async (email: string): Promise<string> => {
  const response = await apiClient.post("/user/forgotPassword", { email });
  return response.data.message;
};

export const resetPasswordService = async (
  token: string,
  password: string
): Promise<string> => {
  const response = await apiClient.post(`/user/resetPassword/${token}`, {
    password,
  });
  return response.data.message;
};

export interface GameHistoryResponse {
  success: boolean;
  games: any[];
  pagination: {
    page: number;
    limit: number;
    totalGames: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const getGameHistoryService = async (
  page = 1,
  limit = 10
): Promise<GameHistoryResponse> => {
  const response = await apiClient.get("/game/gameHistory", {
    params: { page, limit },
  });
  return response.data;
};

export interface UpdateProfilePayload {
  username?: string;
  avatar?: string;
  bio?: string;
  location?: string;
}

export const updateProfileService = async (
  payload: UpdateProfilePayload
): Promise<User> => {
  const response = await apiClient.patch<{ success: boolean; user: any }>(
    "/user/profile",
    payload
  );
  const user = response.data.user;
  return {
    id: user.id || user._id,
    name: user.username,
    email: user.email,
    rating: user.rating ?? 1200,
    avatar: user.avatar,
    bio: user.bio ?? "",
    location: user.location ?? "",
    createdAt: user.createdAt || new Date().toISOString(),
  };
};
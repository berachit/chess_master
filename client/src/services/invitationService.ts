import { Invitation } from "@/types/invitation";
import apiClient from "./apiClient";
import { Game } from "@/types/game";

export interface CreateInvitationPayload {
  receiverId?: string; 
  type: "direct" | "link";
  preferredColor: "white" | "black" | "random";
  timeControl: {
    type: "bullet" | "blitz" | "rapid" | "classical" | "custom";
    initialSeconds: number;
    incrementSeconds?: number;
  };
}

export interface PendingInvitationsResponse {
  success: boolean;
  invitations: Invitation[];
}

export interface AcceptInvitationResponse {
  success: boolean;
  message: string;
  invitation: Invitation;
  game: Game;
}

export const createInvitationService = async (payload: CreateInvitationPayload): Promise<Invitation> => {
  const response = await apiClient.post<{ success: boolean; invitation: Invitation }>("/invitation", payload);
  return response.data.invitation;
};

export const getPendingInvitationsService = async (): Promise<Invitation[]> => {
  const response = await apiClient.get<PendingInvitationsResponse>("/invitation/pending");
  return response.data.invitations;
};

export const getInvitationByCodeService = async (inviteCode: string): Promise<Invitation> => {
  const response = await apiClient.get<{ success: boolean; invitation: Invitation }>(`/invitation/code/${inviteCode}`);
  return response.data.invitation;
};

export const acceptInviteByCodeService = async (inviteCode: string): Promise<AcceptInvitationResponse> => {
  const response = await apiClient.post<AcceptInvitationResponse>(`/invitation/code/${inviteCode}/accept`);
  return response.data;
};

export const acceptInvitationService = async (invitationId: string): Promise<AcceptInvitationResponse> => {
  const response = await apiClient.post<AcceptInvitationResponse>(`/invitation/${invitationId}/accept`);
  return response.data;
};

export const declineInvitationService = async (invitationId: string): Promise<Invitation> => {
  const response = await apiClient.post<{ success: boolean; invitation: Invitation }>(`/invitation/${invitationId}/decline`);
  return response.data.invitation;
};
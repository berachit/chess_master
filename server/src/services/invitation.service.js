import crypto from "node:crypto";
import { User } from "../models/user.model.js";
import Invitation from "../models/invitation.model.js";
import { createGameService } from "./game.service.js";

export const sendInvitationService = async ({
  sender,
  receiverId,
  type,
  preferredColor,
  timeControl,
}) => {
  let receiver = null;
  let inviteCode = null;

  if (type === "direct") {
    if (!receiverId) {
      throw new Error("Receiver is required!");
    }

    receiver = await User.findById(receiverId);

    if (!receiver) {
      throw new Error("Receiver not found");
    }

    if (receiver._id.equals(sender._id)) {
      throw new Error("You cannot invite yourself");
    }
  }

  if (type === "link") {
    inviteCode = crypto.randomBytes(8).toString("hex");
  }

  if (type === "direct") {
    const existingInvitation = await Invitation.findOne({
      sender: sender._id,
      receiver: receiver._id,
      status: "pending",
    });

    if (existingInvitation) {
      throw new Error("A pending invitation already exists");
    }
  }

  const invitation = await Invitation.create({
    sender: sender._id,
    receiver: receiver?._id ?? null,
    type,
    inviteCode,
    preferredColor,
    timeControl,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  return invitation;
};

export const getInvitationByCodeService = async (inviteCode) => {
  const invitation = await Invitation.findOne({ inviteCode })
    .populate("sender", "username rating")
    .populate("receiver", "username rating");

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.status !== "pending") {
    throw new Error("Invitation is no longer active");
  }

  if (invitation.expiresAt < new Date()) {
    invitation.status = "expired";
    await invitation.save();

    throw new Error("Invitation Expired");
  }

  return invitation;
};

export const acceptInvitationService = async ({
  currentUser,
  invitationId,
}) => {
  const invitation = await Invitation.findById(invitationId);

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.status !== "pending") {
    throw new Error("Invitation no longer active");
  }

  if (invitation.expiresAt < new Date()) {
    invitation.status = "expired";
    await invitation.save();

    throw new Error("Invitaion expired");
  }

  if (
    invitation.type === "direct" &&
    !invitation.receiver.equals(currentUser._id)
  ) {
    throw new Error("This invitation is not for you");
  }

  if (invitation.sender.equals(currentUser._id)) {
    throw new Error("You cannot accept your own invitation");
  }

  const sender = await User.findById(invitation.sender);

  if (!sender) {
    throw new Error("Sender not found");
  }

  const game = await createGameService({
    player1: sender,
    player2: currentUser,
    preferredColor: invitation.preferredColor,
    timeControl: invitation.timeControl,
  });

  invitation.status = "accepted";
  invitation.game = game._id;

  await invitation.save();

  return {
    invitation,
    game,
  };
};

export const acceptInviteByCodeService = async ({
  currentUser,
  inviteCode,
}) => {
  const invitation = await Invitation.findOne({ inviteCode });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.type !== "link") {
    throw new Error("This is not a link invitation");
  }

  if (invitation.status !== "pending") {
    throw new Error("Invitation no longer exits!");
  }

  if (invitation.expiresAt < new Date()) {
    invitation.status = "expired";
    await invitation.save();

    throw new Error("Invitation expired");
  }

  if (invitation.sender.equals(currentUser._id)) {
    throw new Error("You cannot accept your own invitation");
  }

  const sender = await User.findById(invitation.sender);

  if (!sender) {
    throw new Error("Sender not found");
  }

  const game = await createGameService({
    player1: sender,
    player2: currentUser,
    preferredColor: invitation.preferredColor,
    timeControl: invitation.timeControl,
  });

  invitation.status = "accepted";
  invitation.receiver = currentUser._id;
  invitation.game = game._id;

  await invitation.save();

  return {
    invitation,
    game,
  };
};

export const declineInvitationService = async ({
  invitationId,
  currentUser,
}) => {
  const invitation = await Invitation.findById(invitationId);

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.status !== "pending") {
    throw new Error("Invitation is no longer active");
  }

  if (invitation.expiresAt < new Date()) {
    invitation.status = "expired";
    await invitation.save();

    throw new Error("Invitation expired");
  }
  if (
    invitation.type === "direct" &&
    !invitation.receiver.equals(currentUser._id)
  ) {
    throw new Error("This invitation is not for you");
  }

  if (invitation.sender.equals(currentUser._id)) {
    throw new Error("You cannot accept your own invitation");
  }

  invitation.status = "declined";

  await invitation.save();

  return invitation;
};

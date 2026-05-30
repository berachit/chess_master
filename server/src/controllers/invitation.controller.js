import Invitation from "../models/invitation.model.js";
import {
  acceptInvitationService,
  acceptInviteByCodeService,
  declineInvitationService,
  getInvitationByCodeService,
  sendInvitationService,
} from "../services/invitation.service.js";

export const sendInvitation = async (req, res) => {
  try {
    const { receiverId, type, preferredColor, timeControl } = req.body;

    const currentUser = req.user;

    const invitation = await sendInvitationService({
      sender: currentUser,
      receiverId,
      type,
      preferredColor,
      timeControl,
    });

    res.status(201).json({
      success: true,
      message: "Invitation sent successfully",
      invitation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInvitationByCode = async (req, res) => {
  try {
    const { inviteCode } = req.params;

    const invitation = await getInvitationByCodeService(inviteCode);

    res.status(200).json({ success: true, invitation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const currentUser = req.user;

    const result = await acceptInvitationService({
      currentUser,
      invitationId,
    });

    res.status(200).json({
      success: true,
      message: "Invitation accepted",
      invitation: result.invitation,
      game: result.game,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptInviteByCode = async (req, res) => {
  try {
    const { inviteCode } = req.params;

    const currentUser = req.user;

    const result = await acceptInviteByCodeService({
      currentUser,
      inviteCode,
    });

    res.status(200).json({
      success: true,
      message: "Invitation accepted",
      invitation: result.invitation,
      game: result.game,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const declineInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const currentUser = req.user;

    const invitation = await declineInvitationService({
      invitationId,
      currentUser,
    });

    res.status(200).json({
      success: true,
      message: "Invitation declined",
      invitation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingInvitation = async (req, res) => {
  try {
    const currentUser = req.user;

    const invitations = await Invitation.find({
      receiver: currentUser._id,
      status: "pending",
      expiresAt: { $gt: new Date() },
    })
      .populate("sender", "username rating")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      invitations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

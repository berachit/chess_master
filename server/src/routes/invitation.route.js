import express from "express";
import { authUser } from "../middlewares/authUser.js";
import {
  acceptInvitation,
  acceptInviteByCode,
  declineInvitation,
  getInvitationByCode,
  getPendingInvitation,
  sendInvitation,
} from "../controllers/invitation.controller.js";

const invitationRouter = express.Router();

invitationRouter.post("/", authUser, sendInvitation);
invitationRouter.get("/pending", authUser, getPendingInvitation);
invitationRouter.get("/code/:inviteCode", authUser, getInvitationByCode);
invitationRouter.post("/code/:inviteCode/accept", authUser, acceptInviteByCode);
invitationRouter.post("/:invitationId/accept", authUser, acceptInvitation);
invitationRouter.post("/:invitationId/decline", authUser, declineInvitation);

export default invitationRouter;

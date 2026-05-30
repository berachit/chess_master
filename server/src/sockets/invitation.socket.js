import {
  acceptInvitationService,
  acceptInviteByCodeService,
  sendInvitationService,
  declineInvitationService,
} from "../services/invitation.service.js";
import { onlineUsers } from "./presence.socket.js";

export const registerInvitationHandlers = (io, socket) => {
  socket.on(
    "send_invitation",
    async ({ receiverId, type, preferredColor, timeControl }) => {
      try {
        let receiverSocket = null;

        if (type === "direct") {
          receiverSocket = onlineUsers.get(receiverId.toString());

          if (!receiverSocket) {
            throw new Error("User is offline");
          }
        }

        const invitation = await sendInvitationService({
          sender: socket.user,
          receiverId,
          type,
          preferredColor,
          timeControl,
        });

        if (type === "direct") {
          io.to(receiverSocket.socketId).emit("invitation_received", {
            success: true,
            invitation,
            sender: {
              id: socket.user._id,
              username: socket.user.username,
              rating: socket.user.rating,
            },
          });
        }

        socket.emit("invitation_sent", {
          success: true,
          invitation,
          inviteLink:
            type === "link"
              ? `${process.env.CLIENT_URL}/invite/${invitation.inviteCode}`
              : null,
        });
      } catch (error) {
        socket.emit("error_message", {
          success: false,
          message: error.message,
        });
      }
    },
  );

  socket.on("accept_invitation", async ({ invitationId }) => {
    try {
      const result = await acceptInvitationService({
        currentUser: socket.user,
        invitationId,
      });

      const senderSocket = onlineUsers.get(result.invitation.sender.toString());

      if (senderSocket) {
        io.to(senderSocket.socketId).emit("invitation_accepted", {
          success: true,
          invitation: result.invitation,
          game: result.game,
        });

        io.to(senderSocket.socketId).emit("game_created", {
          success: true,
          game: result.game,
          gameId: result.game._id,
        });
      }

      socket.emit("invitation_accepted", {
        success: true,
        invitation: result.invitation,
        game: result.game,
      });

      socket.emit("game_created", {
        success: true,
        game: result.game,
        gameId: result.game._id,
      });
    } catch (error) {
      socket.emit("error_message", {
        success: false,
        message: error.message,
      });
    }
  });

  socket.on("accept_invite_code", async ({ inviteCode }) => {
    try {
      const result = await acceptInviteByCodeService({
        currentUser: socket.user,
        inviteCode,
      });

      const senderSocket = onlineUsers.get(result.invitation.sender.toString());

      if (senderSocket) {
        io.to(senderSocket.socketId).emit("invitation_accepted", {
          success: true,
          invitation: result.invitation,
          game: result.game,
        });

        io.to(senderSocket.socketId).emit("game_created", {
          success: true,
          game: result.game,
          gameId: result.game._id,
        });
      }

      socket.emit("invitation_accepted", {
        success: true,
        invitation: result.invitation,
        game: result.game,
      });

      socket.emit("game_created", {
        success: true,
        game: result.game,
        gameId: result.game._id,
      });
    } catch (error) {
      socket.emit("error_message", {
        success: false,
        message: error.message,
      });
    }
  });

  socket.on("decline_invitation", async ({ invitationId }) => {
    try {
      const invitation = await declineInvitationService({
        invitationId,
        currentUser: socket.user,
      });

      const senderSocket = onlineUsers.get(invitation.sender.toString());

      if (senderSocket) {
        io.to(senderSocket.socketId).emit("invitation_declined", {
          success: true,
          invitation,
        });
      }

      socket.emit("invitation_declined", {
        success: true,
        invitation,
      });
    } catch (error) {
      socket.emit("error_message", {
        success: false,
        message: error.message,
      });
    }
  });
};

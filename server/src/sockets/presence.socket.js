export const onlineUsers = new Map();
export const getOnlineUser = (userId) => {
  return onlineUsers.get(userId.toString());
};
export const registerPresenceHandlers = (io, socket) => {
  const userId = socket.user._id.toString();

  onlineUsers.set(userId, {
    socketId: socket.id,
    username: socket.user.username,
  });

  console.log(`${socket.user.username} is online`);

  io.emit("online_users", {
    success: true,
    users: Array.from(onlineUsers.entries()).map(([id, user]) => ({
      userId: id,
      username: user.username,
    })),
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);

    console.log(`${socket.user.username} went offline.`);

    io.emit("online_users", {
      success: true,
      users: Array.from(onlineUsers.entries()).map(([id, user]) => ({
        userId: id,
        username: user.username,
      })),
    });
  });
};

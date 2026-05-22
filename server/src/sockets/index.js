import http from "http";
import { Server } from "socket.io";
import app from "../app.js";
import { socketAuth } from "./middlewares/socketAuth.js";
import { registerGameHandlers } from "./game.socket.js";

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    //   credentials: true,
    methods: ["GET", "POST"],
  },
});

io.use(socketAuth);

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.user.username} (${socket.id})`);

  registerGameHandlers(io, socket);
  
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.user.username}`);
  });
});

export { io, httpServer };

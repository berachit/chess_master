import "dotenv/config";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { httpServer } from "./src/sockets/index.js";

connectDB();

const port = process.env.PORT || 9000;

// app.listen(port, () => {
//   console.log(`ChessMaster saerver running on http://localhost:${port}`);
// });

httpServer.listen(port, () => {
  console.log(`ChessMaster server running on http://localhost:${port} socket.io`);
});

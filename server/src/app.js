import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import gameRouter from "./routes/game.route.js";
import invitationRouter from "./routes/invitation.route.js";

const app = express();

// middlewares
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Chess Master Server Running!");
});

// Api endpoints
app.use("/api/user", userRouter);
app.use("/api/game", gameRouter);
app.use("/api/invitation", invitationRouter);

export default app;

import express from "express";
import {
  createGame,
  getGame,
  makeMove,
  offerDraw,
  resignGame,
} from "../controllers/game.controller.js";
import { authUser } from "../middlewares/authUser.js";

const gameRouter = express.Router();

gameRouter.post("/createGame", authUser, createGame);
gameRouter.post("/makeMove/:gameId", authUser, makeMove);
gameRouter.get("/getGame/:gameId", authUser, getGame);
gameRouter.post("/resignGame/:gameId", authUser, resignGame);
gameRouter.post("/offerDraw/:gameId", authUser, offerDraw);

export default gameRouter;

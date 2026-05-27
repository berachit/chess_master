import express from "express";
import {
  acceptDraw,
  createGame,
  declineDraw,
  getActiveGames,
  getGame,
  getGameHistory,
  makeMove,
  offerDraw,
  resignGame,
} from "../controllers/game.controller.js";
import { authUser } from "../middlewares/authUser.js";

const gameRouter = express.Router();

gameRouter.post("/createGame", authUser, createGame);
gameRouter.post("/makeMove/:gameId", authUser, makeMove);
gameRouter.get("/getGame/:gameId", authUser, getGame);
gameRouter.get("/activeGames", authUser, getActiveGames);
gameRouter.get("/gameHistory", authUser, getGameHistory);
gameRouter.post("/resignGame/:gameId", authUser, resignGame);
gameRouter.post("/offerDraw/:gameId", authUser, offerDraw);
gameRouter.post("/acceptDraw/:gameId", authUser, acceptDraw);
gameRouter.post("/declineDraw/:gameId", authUser, declineDraw);

export default gameRouter;

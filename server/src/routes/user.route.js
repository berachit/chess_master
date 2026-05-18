import express from "express";
import { login, logout, me, register } from "../controllers/user.controller.js";
import { authUser } from "../middlewares/authUser.js";

const userRouter = express.Router();

userRouter.post("/login", login);
userRouter.post("/register", register);
userRouter.post("/logout", logout);
userRouter.get("/me", authUser, me);

export default userRouter;

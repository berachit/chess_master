import express from "express";
import {
  forgotPassword,
  login,
  logout,
  me,
  register,
  resetPassword,
} from "../controllers/user.controller.js";
import { authUser } from "../middlewares/authUser.js";
import { googleAuth } from "../controllers/googleAuth.controller.js";

const userRouter = express.Router();

userRouter.post("/login", login);
userRouter.post("/register", register);
userRouter.post("/googleAuth", googleAuth);
userRouter.post("/logout", logout);
userRouter.get("/me", authUser, me);
userRouter.post("/forgotPassword", forgotPassword);
userRouter.post("/resetPassword/:token", resetPassword);

export default userRouter;

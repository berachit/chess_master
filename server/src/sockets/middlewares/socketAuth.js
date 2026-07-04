import jwt from "jsonwebtoken";
import { parseCookie } from "cookie"; // Use parseCookie
import { User } from "../../models/user.model.js";

export const socketAuth = async (socket, next) => {
  try {
    let token = socket.handshake.auth?.token;

    if (!token && socket.handshake.headers.cookie) {
      const cookies = parseCookie(socket.handshake.headers.cookie || "");
      token = cookies.token;
    }
    
    if(!token){
      return next(new Error("Authentication token missing"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;
    next();
  } catch (error) {
    console.error("Socket Auth verification error:", error);
    if (error.name === "TokenExpiredError") {
      return next(new Error("Token expired"));
    }

    next(new Error("Invalid or expired token"));
  }
};
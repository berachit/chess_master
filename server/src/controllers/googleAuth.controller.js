import jwt from "jsonwebtoken";
import { verifyGoogleToken } from "../services/googleAuth.service.js";
import { User } from "../models/user.model.js";

const createToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Google token is required",
      });
    }

    const googleUser = await verifyGoogleToken(token);

    const {
      sub,
      email,
      name,
      picture,
      email_verified,
    } = googleUser;

    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: "Google email is not verified",
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const baseUsername = name
        .replace(/\s+/g, "")
        .toLowerCase();

      let username = baseUsername;

      let usernameExists = true;

      while (usernameExists) {
        const existingUser = await User.findOne({
          username,
        });

        if (!existingUser) {
          usernameExists = false;
        } else {
          username = `${baseUsername}${Math.floor(
            Math.random() * 10000
          )}`;
        }
      }

      user = await User.create({
        username,
        email,
        googleId: sub,
        avatar: picture,
        authProvider: "google",
      });
    }

    if (!user.googleId) {
      user.googleId = sub;
      user.authProvider = "google";

      if (!user.avatar) {
        user.avatar = picture;
      }

      await user.save();
    }

    const jwtToken = createToken(user._id);

    return res
      .status(200)
      .cookie("token", jwtToken, cookieOptions)
      .json({
        success: true,
        message: "Google authentication successful",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          rating: user.rating,
          bio: user.bio,
          location: user.location,
          authProvider: user.authProvider,
        },
      });
  } catch (error) {
    console.error("Google auth error:", error);

    return res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};
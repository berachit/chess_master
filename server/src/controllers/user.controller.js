import bcrypt from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import crypto from "crypto";
import { sendMail } from "../services/mail.service.js";

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
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
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!validator.isEmail(normalizedEmail)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email" });
    }

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+passwordHash",
    );
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (user.authProvider === "google") {
      return res.status(400).json({
        success: false,
        message:
          "This account is linked with Google. Please login with Google instead.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user);
    res
      .status(200)
      .cookie("token", token, cookieOptions)
      .json({
        success: true,
        message: "Login successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          rating: user.rating,
          avatar: user.avatar,
          bio: user.bio,
          location: user.location,
          authProvider: user.authProvider,
        },
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existsEmail = await User.findOne({ email });
    if (existsEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists!" });
    }
    const existsUsername = await User.findOne({ username });
    if (existsUsername) {
      return res
        .status(400)
        .json({ success: false, message: "Username already exists!" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!validator.isEmail(normalizedEmail)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email" });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain uppercase, lowercase, number and symbol",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email: normalizedEmail,
      passwordHash: hashPassword,
    });

    const token = createToken(newUser);

    res
      .status(201)
      .cookie("token", token, cookieOptions)
      .json({
        success: true,
        message: "User registered successfully",
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          rating: newUser.rating,
          avatar: newUser.avatar,
          bio: newUser.bio,
          location: newUser.location,
          authProvider: newUser.authProvider,
        },
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    res
      .status(200)
      .clearCookie("token", cookieOptions)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const me = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        rating: user.rating,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;

    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/resetPassword/${resetToken}`;

    await sendMail({
      to: user.email,
      subject: "Password Reset",
      html: `
        <h2>Password Reset Request</h2>

        <p>Click below to reset password:</p>

        <a href="${resetUrl}">
          Reset Password
        </a>

        <p>This link expires in 15 minutes.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain uppercase, lowercase, number and symbol",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user.id,
      },
      {
        $set: {
          passwordHash: hashPassword,
          passwordResetExpires: null,
          passwordResetToken: null,
        },
      },
      {
        returnDocument: "after",
      },
    );

    const jwtToken = createToken(updatedUser);
    res
      .status(200)
      .cookie("token", jwtToken, cookieOptions)
      .json({
        success: true,
        message: "Password reset successful",
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          rating: updatedUser.rating,
          avatar: updatedUser.avatar,
          bio: updatedUser.bio,
          location: updatedUser.location,
          authProvider: updatedUser.authProvider,
        },
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, avatar, bio, location } = req.body;
    const user = req.user;

    if (username && username !== user.username) {
      const trimmedUsername = username.trim();
      if (trimmedUsername.length < 3 || trimmedUsername.length > 24) {
        return res.status(400).json({
          success: false,
          message: "Username must be between 3 and 24 characters",
        });
      }

      const existingUser = await User.findOne({ username: trimmedUsername });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already exists!",
        });
      }
      user.username = trimmedUsername;
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }
    if (bio !== undefined) {
      user.bio = bio;
    }
    if (location !== undefined) {
      user.location = location;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        rating: user.rating,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

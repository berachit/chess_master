import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 24,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    googleId:{
      type: String,
      unique: true,
      sparse: true,
    },
    avatar:{
      type: String,
      default: "",
    },
    bio:{
      type: String,
      default: "",
    },
    location:{
      type: String,
      default: "",
    },
    authProvider:{
      type: String,
      enum: ["local","google"],
      default: "local",
    },
    passwordHash: {
      type: String,
      select: false,
      default: null,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires:{
      type: Date,
    },
    rating  : {
        type: Number,
        default: 1200,
    }
  },
  { timestamps: true },
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);

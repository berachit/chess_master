import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "expired"],
      default: "pending",
    },
    preferredColor: {
      type: String,
      enum: ["white", "black", "random"],
      default: "random",
    },
    type:{
        type: String,
        enum: ["direct", "link"],
        default: "direct" 
    },
    inviteCode: {
      type: String,
      unique: true,
      default: null,
    },
    game:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    timeControl: {
      type: {
        type: String,
        enum: ["bullet", "blitz", "rapid", "classical", "custom"],
        required: true,
      },

      initialSeconds: {
        type: Number,
        required: true,
      },

      incrementSeconds: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
);

invitationSchema.index({
  sender: 1,
  receiver: 1,
  status: 1,
});

invitationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const Invitation = mongoose.model("Invitation", invitationSchema);

export default Invitation;

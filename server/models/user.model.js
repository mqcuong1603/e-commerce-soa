import { Schema, model } from "mongoose";
import { compare, genSalt, hash } from "bcryptjs";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    passwordHash: {
      type: String,
    },
    passwordSalt: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    socialMediaId: {
      type: String,
    },
    socialMediaProvider: {
      type: String,
      enum: ["google", "facebook", null],
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password
UserSchema.methods.verifyPassword = async function (password) {
  if (!this.passwordHash) return false;
  return await compare(password, this.passwordHash);
};

// Pre-save hook to hash password
UserSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("passwordHash") || !this.passwordHash) return next();

  try {
    // Generate salt
    const salt = await genSalt(10);
    this.passwordSalt = salt;

    // Hash password
    this.passwordHash = await hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

export default model("User", UserSchema);

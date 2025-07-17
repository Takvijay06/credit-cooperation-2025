import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { IUser, role } from "../common/interface.js";

const userSchema: Schema<IUser> = new Schema(
  {
    serialNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowecase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: role,
      default: role.USER,
    },
    phoneNumber: {
      type: Number,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    emergencyPerson: {
      type: String,
    },
    emergencyContact: {
      type: Number,
    },
    accessToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  const accessToken = jwt.sign(
    {
      id: this._id,
      email: this.email,
      fullName: this.fullName,
      serialNumber: this.serialNumber,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: "1h" },
  );
  return accessToken;
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: "10d",
    },
  );
};

export const User = mongoose.model("User", userSchema);

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true }, // bcrypt hash, never the plain password
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

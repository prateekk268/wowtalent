const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    user_id: {type: String},
    name: { type: String, required: true, trim: true },
    user_name: { type: String, required: true, trim: true, unique: true},
    gender: { type: String,required: true, enum: ["male", "female", "other"] },
    country_code: { type: String,required: true, enum: ["+91", "+92", "+93", "+61", "+86", "+1", "+44"] },
    mobile: { type: String, unique: true, required: true },
    email_id: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, trim: true },
    statuss: { type: String, required: true, enum: ["Public", "Private"] },
    followerCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    followers: { type: Array, default: [] },
    following: { type: Array, default: [] },
    postCount: { type: Number, default: 0 }
    },
  { timestamps: true }
);


  const modelUser = mongoose.model("User", userSchema);

module.exports = modelUser
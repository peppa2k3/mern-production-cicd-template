const mongoose = require('mongoose');

const kolProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    displayName: { type: String, required: true },
    route: { type: String, required: true, unique: true, lowercase: true }, // e.g. "nguyen-van-a" -> /kol/nguyen-van-a
    avatar: { type: String },
    banner: { type: String },
    bio: { type: String },
    socials: {
      facebook: String,
      instagram: String,
      tiktok: String,
      youtube: String,
      website: String,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);


module.exports = mongoose.model('KOLProfile', kolProfileSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['client', 'freelancer'],
    required: true,
  },
  avgRating: {
    type: Number,
    default: 0,
  },
  completedProjects: {
    type: Number,
    default: 0,
  },
  ratingCount: {
    type: Number,
    default: 0,
  },
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  profileImage: {
    type: String,
    default: '',
  },
  skills: {
    type: [String],
    default: [],
  },
  experience: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  portfolioLinks: {
    type: [String],
    default: [],
  },
  district: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

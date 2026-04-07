const User = require('../models/User');

const normalizeLinks = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).map(s => s.trim()).filter(Boolean);
  return String(value)
    .split(/[\n,]/g)
    .map(s => s.trim())
    .filter(Boolean);
};

const normalizeSkills = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).map(s => s.trim()).filter(Boolean);
  return String(value)
    .split(/[\n,]/g)
    .map(s => s.trim())
    .filter(Boolean);
};

const computeProfileCompleted = (user) => {
  // Keep simple and beginner-friendly: all fields must be present for freelancers.
  if (user.role !== 'freelancer') return true;
  const hasImage = Boolean(user.profileImage && user.profileImage.trim());
  const hasSkills = Array.isArray(user.skills) && user.skills.length > 0;
  const hasExperience = Boolean(user.experience && user.experience.trim());
  const hasBio = Boolean(user.bio && user.bio.trim());
  const hasPortfolio = Array.isArray(user.portfolioLinks) && user.portfolioLinks.length > 0;
  return hasImage && hasSkills && hasExperience && hasBio && hasPortfolio;
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};

exports.getContacts = async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } })
    .select('_id name role email profileImage')
    .sort({ name: 1 });
  res.json(users);
};

exports.getFreelancers = async (req, res) => {
  try {
    const freelancers = await User.find({ role: 'freelancer' })
      .select('name profileImage skills avgRating ratingCount completedProjects bio')
      .sort({ avgRating: -1 });
    res.json(freelancers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { profileImage, experience, bio } = req.body;
  if (typeof profileImage === 'string') user.profileImage = profileImage;
  if (typeof experience === 'string') user.experience = experience;
  if (typeof bio === 'string') user.bio = bio;

  user.skills = normalizeSkills(req.body.skills);
  user.portfolioLinks = normalizeLinks(req.body.portfolioLinks);

  user.profileCompleted = computeProfileCompleted(user);

  const saved = await user.save();
  res.json({
    _id: saved._id,
    name: saved.name,
    email: saved.email,
    role: saved.role,
    profileCompleted: saved.profileCompleted,
    profileImage: saved.profileImage,
    skills: saved.skills,
    experience: saved.experience,
    bio: saved.bio,
    portfolioLinks: saved.portfolioLinks,
  });
};


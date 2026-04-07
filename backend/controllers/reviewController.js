const mongoose = require('mongoose');
const Review = require('../models/Review');
const Project = require('../models/Project');
const User = require('../models/User');

const recalcUserRating = async (userId) => {
  const stats = await Review.aggregate([
    { $match: { receiverId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$receiverId',
        avg: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const avg = stats[0]?.avg || 0;
  const count = stats[0]?.count || 0;
  await User.findByIdAndUpdate(userId, {
    avgRating: Number(avg.toFixed(2)),
    ratingCount: count,
  });
};

exports.createReview = async (req, res) => {
  try {
    const { receiverId, projectId, rating, reviewText } = req.body;
    const reviewerId = req.user._id;

    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can give ratings' });
    }

    if (!receiverId || !projectId || !rating) {
      return res.status(400).json({ message: 'receiverId, projectId and rating are required' });
    }
    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.status !== 'completed') {
      return res.status(400).json({ message: 'Reviews allowed only after project completion' });
    }

    const isClientReviewer = String(project.clientId) === String(reviewerId);
    if (!isClientReviewer) {
      return res.status(403).json({ message: 'Only project client can submit reviews' });
    }

    const assignedFreelancerId =
      typeof project.assignedFreelancer === 'object' && project.assignedFreelancer?._id
        ? project.assignedFreelancer._id
        : project.assignedFreelancer;
    const expectedReceiver = String(assignedFreelancerId || '');
    if (!expectedReceiver || String(receiverId) !== expectedReceiver) {
      return res.status(400).json({ message: 'Receiver must be assigned freelancer for this project' });
    }

    const receiver = await User.findById(receiverId).select('role');
    if (!receiver || receiver.role !== 'freelancer') {
      return res.status(400).json({ message: 'Receiver must be a freelancer' });
    }

    const existing = await Review.findOne({ reviewerId, projectId });
    if (existing) return res.status(400).json({ message: 'You already reviewed this project' });

    const review = await Review.create({
      reviewerId,
      receiverId,
      projectId,
      rating: Number(rating),
      reviewText: reviewText || '',
    });

    await recalcUserRating(receiverId);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ receiverId: req.params.userId })
      .populate('reviewerId', 'name role')
      .populate('projectId', 'title status')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewerId: req.user._id })
      .select('projectId receiverId rating reviewText createdAt')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


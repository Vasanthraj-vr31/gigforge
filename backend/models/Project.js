const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedFreelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  bids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  }],
  status: {
    type: String,
    // "closed" = legacy (bid accepted); treat like in-progress for completion flow
    enum: ['open', 'in-progress', 'closed', 'completed'],
    default: 'open',
  },
  district: {
    type: String,
  },
  milestones: [{
    title: String,
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'completed', 'approved'],
      default: 'pending'
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);

const Bid = require('../models/Bid');
const Project = require('../models/Project');

exports.createBid = async (req, res) => {
  try {
    const { projectId, amount, proposal } = req.body;
    
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ message: 'Only freelancers can place bids' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check if bid exists
    const existingBid = await Bid.findOne({ projectId, freelancerId: req.user._id });
    if (existingBid) return res.status(400).json({ message: 'Bid already placed for this project' });

    const bid = await Bid.create({
      projectId,
      freelancerId: req.user._id,
      amount,
      proposal,
    });

    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectBids = async (req, res) => {
  try {
    const bids = await Bid.find({ projectId: req.params.projectId }).populate('freelancerId', 'name skills district');
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.acceptBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });

    const project = await Project.findById(bid.projectId);
    if (project.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    bid.status = 'accepted';
    await bid.save();

    project.status = 'in-progress';
    await project.save();

    // Optionally reject other bids here

    res.json({ message: 'Bid accepted successfully', bid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

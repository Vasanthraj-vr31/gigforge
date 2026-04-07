const Bid = require('../models/Bid');
const Project = require('../models/Project');

const sameId = (a, b) => String(a) === String(b);

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

    project.bids.push(bid._id);
    await project.save();

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

exports.getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user._id })
      .populate({
        path: 'projectId',
        populate: { path: 'clientId', select: 'name email role avgRating ratingCount' },
      })
      .sort({ createdAt: -1 });
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
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Authorize by project ownership (client who created the project). Role string can be stale/missing in DB.
    if (!sameId(project.clientId, req.user._id)) {
      return res.status(403).json({ message: 'Only the project owner can accept bids' });
    }

    if (project.status !== 'open') {
      return res.status(400).json({ message: 'Bid can only be accepted while project is open' });
    }

    const acceptedBidExists = await Bid.findOne({
      projectId: bid.projectId,
      status: 'accepted',
      _id: { $ne: bid._id },
    });
    if (acceptedBidExists) {
      return res.status(400).json({ message: 'A bid is already accepted for this project' });
    }

    if (bid.status === 'accepted') {
      return res.status(400).json({ message: 'Bid already accepted' });
    }

    bid.status = 'accepted';
    await bid.save();

    // Move project to in-progress after accepting one bid.
    project.status = 'in-progress';
    project.assignedFreelancer = bid.freelancerId;
    await project.save();

    // Reject the remaining pending bids.
    await Bid.updateMany(
      { projectId: bid.projectId, _id: { $ne: bid._id }, status: 'pending' },
      { $set: { status: 'rejected' } }
    );

    res.json({ message: 'Bid accepted successfully', bid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });

    const project = await Project.findById(bid.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!sameId(project.clientId, req.user._id)) {
      return res.status(403).json({ message: 'Only the project owner can reject bids' });
    }

    if (project.status !== 'open') {
      return res.status(400).json({ message: 'Bid can only be rejected while project is open' });
    }

    if (bid.status === 'accepted') {
      return res.status(400).json({ message: 'Accepted bid cannot be rejected' });
    }

    bid.status = 'rejected';
    await bid.save();

    res.json({ message: 'Bid rejected successfully', bid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

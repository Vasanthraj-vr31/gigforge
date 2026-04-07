const Project = require('../models/Project');

exports.createProject = async (req, res) => {
  try {
    const { title, description, budget, deadline, district } = req.body;
    
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can create projects' });
    }

    const project = await Project.create({
      title,
      description,
      budget,
      deadline,
      district,
      clientId: req.user._id,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const filter = {};
    if (req.query.district) filter.district = req.query.district;
    if (req.query.status) filter.status = req.query.status;

    const projects = await Project.find(filter)
      .populate('clientId', 'name email role')
      .populate('assignedFreelancer', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('clientId', 'name email role');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    if (project.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.completeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ message: 'Only freelancers can complete projects' });
    }
    if (!project.assignedFreelancer || String(project.assignedFreelancer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only assigned freelancer can mark project as completed' });
    }
    const canComplete = project.status === 'in-progress' || project.status === 'closed';
    if (!canComplete) {
      return res.status(400).json({ message: 'Only active projects can be marked completed' });
    }

    project.status = 'completed';
    await project.save();

    const User = require('../models/User');
    await User.findByIdAndUpdate(project.assignedFreelancer, { $inc: { completedProjects: 1 } });
    await User.findByIdAndUpdate(project.clientId, { $inc: { completedProjects: 1 } });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

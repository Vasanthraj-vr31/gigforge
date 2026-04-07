const express = require('express');
const { createProject, getProjects, getProjectById, updateProject } = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.route('/')
  .post(protect, createProject)
  .get(getProjects);

router.route('/:id')
  .get(getProjectById)
  .put(protect, updateProject);

module.exports = router;

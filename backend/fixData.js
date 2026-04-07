require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Review = require('./models/Review');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to DB. Fixing data...');

  // Reset all user counts
  await User.updateMany({}, { $set: { completedProjects: 0, ratingCount: 0, avgRating: 0 } });

  // Count completed projects for clients
  const clientProjects = await Project.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: '$clientId', count: { $sum: 1 } } }
  ]);
  
  for (const c of clientProjects) {
    if (c._id) await User.findByIdAndUpdate(c._id, { completedProjects: c.count });
  }

  // Count completed projects for freelancers
  const freelancerProjects = await Project.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: '$assignedFreelancer', count: { $sum: 1 } } }
  ]);

  for (const f of freelancerProjects) {
    if (f._id) await User.findByIdAndUpdate(f._id, { completedProjects: f.count });
  }

  // Recalculate reviews
  const reviews = await Review.aggregate([
    {
      $group: {
        _id: '$receiverId',
        avg: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  for (const r of reviews) {
    if (r._id) {
       await User.findByIdAndUpdate(r._id, {
         avgRating: Number(r.avg.toFixed(2)),
         ratingCount: r.count,
       });
    }
  }

  console.log('Data fixed gracefully!');
  process.exit(0);
}).catch(console.error);

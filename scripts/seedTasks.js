import mongoose from 'mongoose';
import User from '../models/user.js';
import ProjectSpace from '../models/projectSpace.js';
import Task from '../models/Task.js';

const connectDB = async () => {
  await mongoose.connect('mongodb://localhost:27017/lynxapp');
};

const seedTasks = async () => {
  console.log('📝 Seeding tasks...');

  // Clear existing tasks
  await Task.deleteMany({});
  console.log('🗑️  Cleared existing tasks');

  const users = await User.find();
  const projects = await ProjectSpace.find();

  const tasks = [
    {
      title: 'Create wireframes',
      description: 'Design homepage and dashboard wireframes',
      projectSpace: projects[0]._id,
      assigner: users[0]._id,
      assignee: users[1]._id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Set up backend API',
      description: 'Initialize Express and MongoDB',
      projectSpace: projects[0]._id,
      assigner: users[0]._id,
      assignee: users[2]._id,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Implement authentication',
      description: 'JWT-based login & registration',
      projectSpace: projects[1]._id,
      assigner: users[1]._id,
      assignee: users[0]._id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Launch marketing ads',
      description: 'Prepare Facebook and Google Ads',
      projectSpace: projects[2]._id,
      assigner: users[2]._id,
      assignee: users[0]._id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    }
  ];

  const savedTasks = await Task.insertMany(tasks);
  console.log(`✅ Created ${savedTasks.length} tasks`);

  // Display summary
  const allTasks = await Task.find()
    .populate('projectSpace', 'name')
    .populate('assignee', 'username')
    .populate('assigner', 'username');

  console.log('\n📋 Task Summary:');
  allTasks.forEach(task => {
    console.log(
      `- ${task.title} | Project: ${task.projectSpace.name} | Assignee: ${task.assignee.username}`
    );
  });

  mongoose.disconnect();
  console.log('🔌 MongoDB disconnected');
};

connectDB().then(seedTasks).catch(console.error);

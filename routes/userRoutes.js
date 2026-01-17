import express from 'express';
import User from '../models/user.js';
import ProjectSpace from '../models/projectSpace.js';
import Task from '../models/task.js'


const router = express.Router();

// REGISTER NEW USER
router.post('/register', async (req, res) => {
  try {
    const { username, firstname, lastname, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email or username already exists' 
      });
    }
    
    // Create new user
    const user = new User({
      username,
      firstname,
      lastname,
      email,
      password // ⚠️ In production, hash this!
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        _id: user._id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating user', 
      error: error.message 
    });
  }
});

// LOGIN USER
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by email
    console.log("Incoming login body:", req.body);
    const user = await User.findOne({ username});
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    // Check password (in real app, use bcrypt!)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
});

// GET PROJECT SPACES USER IS IN
router.get('/:userId/projects', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Find projects where user is a member
    const projects = await ProjectSpace.find({
      'members.user': userId
    })
    .populate('owner', 'username firstname lastname email')
    .populate('members.user', 'username firstname lastname email');
    
    // Add role information for each project
    const projectsWithRole = projects.map(project => {
      const userMembership = project.members.find(member => 
        member.user._id.toString() === userId
      );
      
      return {
        _id: project._id,
        name: project.name,
        description: project.description,
        owner: project.owner,
        members: project.members,
        userRole: userMembership ? userMembership.role : null,
        isOwner: project.owner._id.toString() === userId,
        createdAt: project.createdAt
      };
    });
    
    res.json({
      success: true,
      count: projectsWithRole.length,
      projects: projectsWithRole
    });
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
});

// GET USER Data BY ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// GET ALL USERS (for testing)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});



///// USER-TASKS RELATED APIS
// 1. GET TASKS OF A USER 
router.get('/:userId/tasks', async (req, res) => {
  try {
    const { userId } = req.params;
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all tasks assigned to this user
    const tasks = await Task.find({ assignee: userId })
      .populate('projectSpace', 'name')
      .populate('assignee', 'username firstname lastname')
      .populate('assigner', 'username')
      .sort({ dueDate: 1, createdAt: -1 });

    res.json({
      success: true,
      message: 'User tasks retrieved successfully',
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user tasks',
      error: error.message
    });
  }
});

export default router;
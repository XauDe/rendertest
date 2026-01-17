import dotenv from "dotenv";
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
// Import routes
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import projectGoalRoutes from './routes/projectGoalRoutes.js'
import projecetMessageRoutes from './routes/projectMessageRoutes.js'
import boardRoutes from "./routes/boardRoutes.js";
import singleBoardRoutes from "./routes/singleBoardRoutes.js";
import kanbanRoutes from "./routes/kanbanRoutes.js";
import mindmapRoutes from "./routes/mindmapRoutes.js";


dotenv.config();
const app = express();
const port = 3500;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err);
  });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects/:projectId/goals', projectGoalRoutes);
app.use('/api/projects/:projectId/messages', projecetMessageRoutes);
app.use("/api/projects/:projectId/boards", boardRoutes);
app.use("/api/boards", singleBoardRoutes);
app.use("/api/boards/:boardId/kanban", kanbanRoutes);
app.use("/api/boards/:boardId/mindmap", mindmapRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(port, () => {
  console.log('Server is running');

});

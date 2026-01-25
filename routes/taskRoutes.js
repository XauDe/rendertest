import express from "express";
import Task from "../models/task.js";
import User from "../models/user.js";
import ProjectSpace from "../models/projectSpace.js";

const router = express.Router();

/**
 * CREATE TASK
 */
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      dueDate,
      projectSpace,
      assignee,
      assigner,
      priority
    } = req.body;

    // Validate project exists
    const project = await ProjectSpace.findById(projectSpace);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Validate users exist
    const assignedUser = await User.findById(assignee);
    const assigningUser = await User.findById(assigner);

    if (!assignedUser || !assigningUser) {
      return res.status(404).json({
        success: false,
        message: "Assignee or assigner not found"
      });
    }

    const task = new Task({
      title,
      description,
      dueDate,
      projectSpace,
      assignee,
      assigner,
      priority
    });

    await task.save();

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating task",
      error: error.message
    });
  }
});

/**
 * GET TASK BY ID
 */
router.get("/:taskId", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate("projectSpace", "name")
      .populate("assignee", "username firstname lastname")
      .populate("assigner", "username firstname lastname");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error("Fetch task error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching task",
      error: error.message
    });
  }
});

/**
 * UPDATE TASK (general fields)
 */
router.patch("/:taskId", async (req, res) => {
  try {
    const updates = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      updates,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.json({
      success: true,
      message: "Task updated",
      task
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating task",
      error: error.message
    });
  }
});

/**
 * DELETE TASK
 */
router.delete("/:taskId", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.json({
      success: true,
      message: "Task deleted"
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting task",
      error: error.message
    });
  }
});

/**
 * GET TASKS IN A PROJECT
 */
router.get("/project/:projectId", async (req, res) => {
  try {
    const tasks = await Task.find({ projectSpace: req.params.projectId })
      .populate("projectSpace", "name")
      .populate("assignee", "username firstname lastname")
      .populate("assigner", "username");

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error("Fetch project tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching project tasks",
      error: error.message
    });
  }
});

/**
 * GET TASKS ASSIGNED TO USER (GLOBAL TASK BAR)
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const tasks = await Task.find({ assignee: req.params.userId })
      .populate("projectSpace", "name")
      .sort({ completed: 1, dueDate: 1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error("Fetch user tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user tasks",
      error: error.message
    });
  }
});

/**
 * MARK TASK COMPLETE / INCOMPLETE
 */
router.patch("/:taskId/complete", async (req, res) => {
  try {
    const { completed } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { completed },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.json({
      success: true,
      message: "Task completion updated",
      task
    });
  } catch (error) {
    console.error("Complete task error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating task completion",
      error: error.message
    });
  }
});

/**
 * UPDATE TASK STATUS (KANBAN)
 */
router.patch("/:taskId/status", async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.json({
      success: true,
      message: "Task status updated",
      task
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating task status",
      error: error.message
    });
  }
});

/**
 * REASSIGN TASK
 */
router.patch("/:taskId/reassign", async (req, res) => {
  try {
    const { assignee } = req.body;

    const user = await User.findById(assignee);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "New assignee not found"
      });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { assignee },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.json({
      success: true,
      message: "Task reassigned",
      task
    });
  } catch (error) {
    console.error("Reassign task error:", error);
    res.status(500).json({
      success: false,
      message: "Error reassigning task",
      error: error.message
    });
  }
});

export default router;

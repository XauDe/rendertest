import express from "express";
import ProjectGoal from "../models/projectGoal.js";
import ProjectSpace from "../models/projectSpace.js";

const router = express.Router({ mergeParams: true });

/**
 * CREATE GOAL
 * (Owner/Admin only – enforced later)
 */
router.post("/", async (req, res) => {
   console.log("GOAL ROUTE HIT");
  console.log("All params:", req.params);
  console.log("ProjectId from params:", req.params.projectId);
  console.log("ProjectId from body:", req.body.projectId);
  console.log("Full URL:", req.originalUrl);
  
  try {
    const { title, description, dueDate, status } = req.body;

    const project = await ProjectSpace.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const goal = new ProjectGoal({
      title,
      description,
      dueDate,
      status,
      projectSpace: project._id
    });

    await goal.save();

    res.status(201).json({
      success: true,
      message: "Goal created successfully",
      goal
    });
  } catch (error) {
    console.error("Create goal error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating goal",
      error: error.message
    });
  }
});

/**
 * GET ALL GOALS IN PROJECT
 */
router.get("/", async (req, res) => {
  try {
    const goals = await ProjectGoal.find({
      projectSpace: req.params.projectId
    }).sort({ dueDate: 1, createdAt: -1 });

    res.json({
      success: true,
      count: goals.length,
      goals
    });
  } catch (error) {
    console.error("Fetch goals error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching goals",
      error: error.message
    });
  }
});

/**
 * GET GOAL BY ID
 */
router.get("/:goalId", async (req, res) => {
  try {
    const goal = await ProjectGoal.findOne({
      _id: req.params.goalId,
      projectSpace: req.params.projectId
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found"
      });
    }

    res.json({
      success: true,
      goal
    });
  } catch (error) {
    console.error("Fetch goal error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching goal",
      error: error.message
    });
  }
});

/**
 * UPDATE GOAL
 */
router.patch("/:goalId", async (req, res) => {
  try {
    const goal = await ProjectGoal.findOneAndUpdate(
      {
        _id: req.params.goalId,
        projectSpace: req.params.projectId
      },
      req.body,
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found"
      });
    }

    res.json({
      success: true,
      message: "Goal updated",
      goal
    });
  } catch (error) {
    console.error("Update goal error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating goal",
      error: error.message
    });
  }
});

/**
 * DELETE GOAL
 */
router.delete("/:goalId", async (req, res) => {
  try {
    const goal = await ProjectGoal.findOneAndDelete({
      _id: req.params.goalId,
      projectSpace: req.params.projectId
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found"
      });
    }

    res.json({
      success: true,
      message: "Goal deleted"
    });
  } catch (error) {
    console.error("Delete goal error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting goal",
      error: error.message
    });
  }
});

export default router;

import express from "express";
import Board from "../models/board.js";
import ProjectSpace from "../models/projectSpace.js";

const router = express.Router({ mergeParams: true });

/**
 * CREATE BOARD
 */
router.post("/", async (req, res) => {
  try {
    const { name, type, createdBy } = req.body;
    const { projectId } = req.params;

    const project = await ProjectSpace.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const board = new Board({
      name,
      type,
      projectSpace: projectId,
      createdBy,
    });

    await board.save();

    res.status(201).json({
      success: true,
      board,
    });
  } catch (error) {
    console.error("Create board error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating board",
      error: error.message,
    });
  }
});

/**
 * GET ALL BOARDS IN PROJECT
 */
router.get("/", async (req, res) => {
  try {
    const boards = await Board.find({
      projectSpace: req.params.projectId,
      archived: false,
    }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: boards.length,
      boards,
    });
  } catch (error) {
    console.error("Fetch boards error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching boards",
      error: error.message,
    });
  }
});

export default router;

import express from "express";
import Board from "../models/board.js";

const router = express.Router();

/**
 * GET BOARD METADATA
 */
router.get("/:boardId", async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    res.json({
      success: true,
      board,
    });
  } catch (error) {
    console.error("Fetch board error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching board",
      error: error.message,
    });
  }
});

/**
 * UPDATE BOARD (rename / archive)
 */
router.patch("/:boardId", async (req, res) => {
  try {
    const board = await Board.findByIdAndUpdate(
      req.params.boardId,
      req.body,
      { new: true }
    );

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    res.json({
      success: true,
      board,
    });
  } catch (error) {
    console.error("Update board error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating board",
      error: error.message,
    });
  }
});

/**
 * DELETE BOARD
 */
router.delete("/:boardId", async (req, res) => {
  try {
    const board = await Board.findByIdAndDelete(req.params.boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    res.json({
      success: true,
      message: "Board deleted",
    });
  } catch (error) {
    console.error("Delete board error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting board",
      error: error.message,
    });
  }
});

export default router;

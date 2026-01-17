import express from "express";
import KanbanBoard from "../models/kanbanBoard.js";
import Board from "../models/board.js";

const router = express.Router({ mergeParams: true });

/**
 * CREATE KANBAN CONFIG FOR BOARD
 */
router.post("/", async (req, res) => {
  try {
    const { boardId } = req.params;

    const board = await Board.findById(boardId);
    if (!board || board.type !== "kanban") {
      return res.status(400).json({
        success: false,
        message: "Invalid Kanban board",
      });
    }

    const existing = await KanbanBoard.findOne({ board: boardId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Kanban config already exists",
      });
    }

    const kanban = new KanbanBoard({
      board: boardId,
      projectSpace: board.projectSpace,
      columns: [
        { key: "todo", title: "To Do", taskIds: [] },
        { key: "in_progress", title: "In Progress", taskIds: [] },
        { key: "review", title: "Review", taskIds: [] },
        { key: "done", title: "Done", taskIds: [] },
      ],
    });

    await kanban.save();

    res.status(201).json({
      success: true,
      kanban,
    });
  } catch (error) {
    console.error("Create kanban error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating kanban board",
      error: error.message,
    });
  }
});

/**
 * GET KANBAN BOARD
 */router.get("/", async (req, res) => {
  try {
    const kanban = await KanbanBoard.findOne({
      board: req.params.boardId,
    }).populate("columns.taskIds");

    if (!kanban) {
      return res.status(404).json({
        success: false,
        message: "Kanban board not found",
      });
    }

    const columns = kanban.columns.map((col) => ({
      key: col.key,
      title: col.title,
      tasks: col.taskIds.map((task) => ({
        id: task._id.toString(),
        title: task.title,
        assignee: task.assignee
          ? task.assignee.username
          : "Unassigned",
      })),
    }));

    res.json({
      success: true,
      board: {
        _id: kanban.board,
        type: "kanban",
        config: {
          columns,
        },
      },
    });
  } catch (error) {
    console.error("Fetch kanban error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching kanban board",
      error: error.message,
    });
  }
});

/**
 * UPDATE TASK ORDER / MOVE TASK
 */
router.patch("/tasks", async (req, res) => {
  try {
    const { columns } = req.body;

    const kanban = await KanbanBoard.findOneAndUpdate(
      { board: req.params.boardId },
      { columns },
      { new: true }
    );

    if (!kanban) {
      return res.status(404).json({
        success: false,
        message: "Kanban board not found",
      });
    }

    res.json({
      success: true,
      kanban,
    });
  } catch (error) {
    console.error("Update tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating kanban tasks",
      error: error.message,
    });
  }
});

/**
 * UPDATE COLUMNS (rename / reorder)
 */
router.patch("/columns", async (req, res) => {
  try {
    const { columns } = req.body;

    const kanban = await KanbanBoard.findOneAndUpdate(
      { board: req.params.boardId },
      { columns },
      { new: true }
    );

    if (!kanban) {
      return res.status(404).json({
        success: false,
        message: "Kanban board not found",
      });
    }

    res.json({
      success: true,
      kanban,
    });
  } catch (error) {
    console.error("Update columns error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating kanban columns",
      error: error.message,
    });
  }
});

export default router;

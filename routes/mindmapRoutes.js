import express from "express";
import Mindmap from "../models/mindMap.js";
import Board from "../models/board.js";
import mongoose from "mongoose";

const router = express.Router({ mergeParams: true });

/**
 * CREATE MINDMAP CONFIG
 */
router.post("/", async (req, res) => {
  try {
    const { boardId } = req.params;

    const board = await Board.findById(boardId);
    if (!board || board.type !== "mindmap") {
      return res.status(400).json({
        success: false,
        message: "Invalid mindmap board",
      });
    }

    const existing = await Mindmap.findOne({ board: boardId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Mindmap already exists",
      });
    }

    const rootNodeId = new mongoose.Types.ObjectId();

    const mindmap = new Mindmap({
      board: boardId,
      projectSpace: board.projectSpace,
      nodes: [
        {
          _id: rootNodeId,
          text: "Root",
          parentId: null,
          order: 0,
        },
      ],
    });

    await mindmap.save();

    res.status(201).json({
      success: true,
      mindmap,
    });
  } catch (error) {
    console.error("Create mindmap error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating mindmap",
      error: error.message,
    });
  }
});

/**
 * GET MINDMAP
 */
router.get("/", async (req, res) => {
  try {
    const mindmap = await Mindmap.findOne({
      board: req.params.boardId,
    });

    if (!mindmap) {
      return res.status(404).json({
        success: false,
        message: "Mindmap not found",
      });
    }

    res.json({
      success: true,
      board: {
        _id: mindmap.board,
        type: "mindmap",
        config: {
          nodes: mindmap.nodes,
        },
      },
    });
  } catch (error) {
    console.error("Fetch mindmap error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching mindmap",
      error: error.message,
    });
  }
});
/**
 * ADD MINDMAP NODE
 */
router.post("/nodes", async (req, res) => {
  try {
    const { parentId, text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        message: "Node text is required",
      });
    }

    const mindmap = await Mindmap.findOne({
      board: req.params.boardId,
    });

    if (!mindmap) {
      return res.status(404).json({
        success: false,
        message: "Mindmap not found",
      });
    }

    const siblings = mindmap.nodes.filter(
      (n) =>
        String(n.parentId || null) ===
        String(parentId || null)
    );

    const newNode = {
      _id: new mongoose.Types.ObjectId(),
      text,
      parentId: parentId || null,
      order: siblings.length,
    };

    mindmap.nodes.push(newNode);
    await mindmap.save();

    res.status(201).json({
      success: true,
      node: newNode,
      mindmap,
    });
  } catch (error) {
    console.error("Add node error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding node",
      error: error.message,
    });
  }
});


/**
 * UPDATE MINDMAP NODES
 * (add / rename / delete / reorder)
 */
router.patch("/nodes", async (req, res) => {
  try {
    const { nodes } = req.body;

    if (!Array.isArray(nodes)) {
      return res.status(400).json({
        success: false,
        message: "nodes must be an array",
      });
    }

    const mindmap = await Mindmap.findOneAndUpdate(
      { board: req.params.boardId },
      { nodes },
      { new: true }
    );

    if (!mindmap) {
      return res.status(404).json({
        success: false,
        message: "Mindmap not found",
      });
    }

    res.json({
      success: true,
      mindmap,
    });
  } catch (error) {
    console.error("Update mindmap nodes error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating mindmap",
      error: error.message,
    });
  }
});


/**
 * DELETE NODE (and its subtree)
 */
router.delete("/nodes/:nodeId", async (req, res) => {
  try {
    const { boardId, nodeId } = req.params;

    const mindmap = await Mindmap.findOne({ board: boardId });
    if (!mindmap) {
      return res.status(404).json({
        success: false,
        message: "Mindmap not found",
      });
    }

    const nodes = mindmap.nodes;

    // Collect all nodes to delete (node + descendants)
    const idsToDelete = new Set();

    const collectDescendants = (id) => {
      idsToDelete.add(String(id));
      nodes.forEach((n) => {
        if (String(n.parentId) === String(id)) {
          collectDescendants(n._id);
        }
      });
    };

    collectDescendants(nodeId);

    // Filter out deleted nodes
    const remainingNodes = nodes.filter(
      (n) => !idsToDelete.has(String(n._id))
    );

    // Reorder siblings for each parent
    const reorder = {};
    remainingNodes.forEach((n) => {
      const parentKey = String(n.parentId || "root");
      if (!reorder[parentKey]) reorder[parentKey] = [];
      reorder[parentKey].push(n);
    });

    Object.values(reorder).forEach((siblings) => {
      siblings
        .sort((a, b) => a.order - b.order)
        .forEach((node, index) => {
          node.order = index;
        });
    });

    mindmap.nodes = remainingNodes;
    await mindmap.save();

    res.json({
      success: true,
      nodes: mindmap.nodes,
    });
  } catch (error) {
    console.error("Delete node error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting node",
      error: error.message,
    });
  }
});



export default router;
import express from "express";
import ProjectMessage from "../models/projectMessage.js";
import ProjectSpace from "../models/projectSpace.js";
import User from "../models/user.js";

const router = express.Router({ mergeParams: true });

/**
 * SEND MESSAGE
 */
router.post("/", async (req, res) => {
  try {
    const { body, senderId } = req.body;
    const { projectId } = req.params;

    const project = await ProjectSpace.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "Sender not found"
      });
    }

    const message = new ProjectMessage({
      projectSpace: projectId,
      sender: senderId,
      body
    });

    await message.save();

    res.status(201).json({
      success: true,
      message: "Message sent",
      data: message
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending message",
      error: error.message
    });
  }
});

/**
 * GET PROJECT MESSAGES
 */
router.get("/", async (req, res) => {
  try {
    const { projectId } = req.params;

    const messages = await ProjectMessage.find({
      projectSpace: projectId
    })
      .populate("sender", "username firstname lastname")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    console.error("Fetch messages error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching messages",
      error: error.message
    });
  }
});

/**
 * DELETE MESSAGE (optional, future permission checks)
 */
router.delete("/:messageId", async (req, res) => {
  try {
    const message = await ProjectMessage.findByIdAndDelete(
      req.params.messageId
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    res.json({
      success: true,
      message: "Message deleted"
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting message",
      error: error.message
    });
  }
});

export default router;

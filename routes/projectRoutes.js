import express from "express";
import ProjectSpace from "../models/projectSpace.js";
import User from "../models/user.js";

const router = express.Router();

/**
 * CREATE PROJECT
 */
router.post("/", async (req, res) => {
  try {
    const { name, description, ownerId } = req.body;

    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found"
      });
    }

    const project = new ProjectSpace({
      name,
      description,
      owner: ownerId
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating project",
      error: error.message
    });
  }
});

/**
 * GET ALL PROJECTS (testing/admin)
 */
router.get("/", async (req, res) => {
  try {
    const projects = await ProjectSpace.find()
      .populate("owner", "username firstname lastname")
      .populate("members.user", "username firstname lastname");

    res.json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    console.error("Fetch projects error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching projects",
      error: error.message
    });
  }
});

/**
 * GET PROJECT BY ID
 */
router.get("/:projectId", async (req, res) => {
  try {
    const project = await ProjectSpace.findById(req.params.projectId)
      .populate("owner", "username firstname lastname email")
      .populate("members.user", "username firstname lastname email");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error("Fetch project error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching project",
      error: error.message
    });
  }
});

/**
 * UPDATE PROJECT (name, description)
 */
router.patch("/:projectId", async (req, res) => {
  try {
    const updates = req.body;

    const project = await ProjectSpace.findByIdAndUpdate(
      req.params.projectId,
      updates,
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.json({
      success: true,
      message: "Project updated successfully",
      project
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating project",
      error: error.message
    });
  }
});

/**
 * ARCHIVE PROJECT (soft delete)
 */
router.patch("/:projectId/archive", async (req, res) => {
  try {
    const project = await ProjectSpace.findByIdAndUpdate(
      req.params.projectId,
      { archived: true },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.json({
      success: true,
      message: "Project archived",
      project
    });
  } catch (error) {
    console.error("Archive project error:", error);
    res.status(500).json({
      success: false,
      message: "Error archiving project",
      error: error.message
    });
  }
});

/**
 * GET PROJECT MEMBERS
 */
router.get("/:projectId/members", async (req, res) => {
  try {
    const project = await ProjectSpace.findById(req.params.projectId)
      .populate("members.user", "username firstname lastname email");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.json({
      success: true,
      members: project.members
    });
  } catch (error) {
    console.error("Fetch members error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching members",
      error: error.message
    });
  }
});

/**
 * ADD MEMBER TO PROJECT
 */
router.post("/:projectId/members", async (req, res) => {
  try {
    const { userId, role } = req.body;

    const project = await ProjectSpace.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const alreadyMember = project.members.some(
      (member) => member.user.toString() === userId
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User already a member of this project"
      });
    }

    project.members.push({
      user: userId,
      role: role || "member"
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: "Member added successfully",
      members: project.members
    });
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding member",
      error: error.message
    });
  }
});

/**
 * UPDATE MEMBER ROLE
 */
router.patch("/:projectId/members/:userId", async (req, res) => {
  try {
    const { role } = req.body;

    const project = await ProjectSpace.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.params.userId
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    member.role = role;
    await project.save();

    res.json({
      success: true,
      message: "Member role updated",
      member
    });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating role",
      error: error.message
    });
  }
});

router.delete("/:projectId/members/:userId", async (req, res) => {
  try {
    const project = await ProjectSpace.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    project.members = project.members.filter(
      (member) => member.user.toString() !== req.params.userId
    );

    await project.save();

    res.json({
      success: true,
      message: "Member removed successfully",
      members: project.members
    });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing member",
      error: error.message
    });
  }
});

export default router;

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Agent = require("../models/Agent");
const Ticket = require("../models/Ticket");
const { requireAuth, requireRole } = require("./auth");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const TOKEN_EXPIRES = "8h";

function signToken({ id, role, username }) {
  return jwt.sign({ sub: String(id), role, username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
}

// ----------------------- AUTH -----------------------

// USER signup
router.post("/auth/user/signup", async (req, res) => {
  try {
    const { username, password, email, displayName } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: "username and password required" });

    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ error: "Username already exists" });

    const legacyId = Date.now();
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      legacyId,
      username,
      email: email || (username.includes("@") ? username : ""),
      displayName: displayName || username,
      passwordHash
    });

    const token = signToken({ id: user._id, role: "user", username: user.username });
    return res.status(201).json({ token, role: "user", userId: user._id, legacyId: user.legacyId, username: user.username });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: "Duplicate" });
    return res.status(500).json({ error: "Server error" });
  }
});

// USER login
router.post("/auth/user/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: "username and password required" });

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken({ id: user._id, role: "user", username: user.username });
    return res.json({ token, role: "user", userId: user._id, legacyId: user.legacyId, username: user.username });
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

// AGENT login (no signup)
router.post("/auth/agent/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: "username and password required" });

    const agent = await Agent.findOne({ username });
    if (!agent) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, agent.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken({ id: agent._id, role: "agent", username: agent.username });
    return res.json({ token, role: "agent", agentId: agent._id, legacyId: agent.legacyId, username: agent.username });
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

// Current user
router.get("/me", requireAuth, async (req, res) => {
  return res.json({ role: req.auth.role, userId: req.auth.sub, username: req.auth.username });
});

// ----------------------- USER TICKETS -----------------------

// Create ticket (user)
router.post("/user/tickets", requireAuth, requireRole("user"), async (req, res) => {
  try {
    const { title, type, description, priority } = req.body || {};
    if (!title || !description) return res.status(400).json({ error: "title and description required" });

    const user = await User.findById(req.auth.sub);
    if (!user) return res.status(401).json({ error: "Invalid user" });

    const ticket = await Ticket.create({
      legacyId: Date.now(),
      userId: user._id,
      userLegacyId: user.legacyId,
      userEmail: user.email || user.username,
      title,
      type: type || "support",
      description,
      status: "Open",
      priority: priority || "Normal",
      messages: [
        {
          message: description,
          authorRole: "user",
          authorName: user.displayName || user.username,
          internal: false
        }
      ]
    });

    return res.status(201).json(ticket);
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

// List my tickets (user)
router.get("/user/tickets", requireAuth, requireRole("user"), async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.auth.sub }).sort({ updatedAt: -1 });
    return res.json(tickets);
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

// Read one of my tickets
router.get("/user/tickets/:id", requireAuth, requireRole("user"), async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, userId: req.auth.sub });
    if (!ticket) return res.status(404).json({ error: "Not found" });
    return res.json(ticket);
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

// User adds a message (public)
router.post("/user/tickets/:id/messages", requireAuth, requireRole("user"), async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "message required" });

    const user = await User.findById(req.auth.sub);
    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.sub },
      {
        $push: {
          messages: {
            message,
            authorRole: "user",
            authorName: user?.displayName || user?.username || "User",
            internal: false,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    if (!ticket) return res.status(404).json({ error: "Not found" });
    return res.json(ticket);
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});


// DELETE ticket owned by current user
router.delete("/user/tickets/:id", requireAuth, requireRole("user"), async (req, res) => {
  try {
    const ticket = await Ticket.findOneAndDelete({ _id: req.params.id, userId: req.auth.sub });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});


// ----------------------- AGENT TICKETS -----------------------

// List all tickets (agent)
router.get("/agent/tickets", requireAuth, requireRole("agent"), async (_req, res) => {
  try {
    const tickets = await Ticket.find().sort({ updatedAt: -1 });
    return res.json(tickets);
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

// Read one ticket (agent)
router.get("/agent/tickets/:id", requireAuth, requireRole("agent"), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Not found" });
    return res.json(ticket);
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

// Update ticket status/fields (agent)
router.put("/agent/tickets/:id", requireAuth, requireRole("agent"), async (req, res) => {
  try {
    const safe = { ...req.body };
    delete safe.userId;
    delete safe.userLegacyId;
    delete safe.userEmail;

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $set: safe },
      { new: true, runValidators: true }
    );
    if (!ticket) return res.status(404).json({ error: "Not found" });
    return res.json(ticket);
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

// Agent reply (public)
router.post("/agent/tickets/:id/reply", requireAuth, requireRole("agent"), async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "message required" });

    const agent = await Agent.findById(req.auth.sub);

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          messages: {
            message,
            authorRole: "agent",
            authorName: agent?.displayName || agent?.username || "Agent",
            internal: false,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    if (!ticket) return res.status(404).json({ error: "Not found" });
    return res.json(ticket);
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

// Agent note (internal)
router.post("/agent/tickets/:id/notes", requireAuth, requireRole("agent"), async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "message required" });

    const agent = await Agent.findById(req.auth.sub);

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          messages: {
            message,
            authorRole: "agent",
            authorName: agent?.displayName || agent?.username || "Agent",
            internal: true,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    if (!ticket) return res.status(404).json({ error: "Not found" });
    return res.json(ticket);
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

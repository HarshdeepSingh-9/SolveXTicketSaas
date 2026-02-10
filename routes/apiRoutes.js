const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// File paths
const usersFile = path.join(__dirname, "../data/users.json");
const agentsFile = path.join(__dirname, "../data/agents.json");
const ticketsFile = path.join(__dirname, "../data/tickets.json");

// Helper functions
function readJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]"); // ensure file exists
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Error reading JSON:", err);
    return [];
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ----------------------- USER & AGENT LOGIN -----------------------
router.get("/login", (req, res) => {
  const { username, password, role } = req.query;

  if (role === "user") {
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === username && u.password === password);
    if (user) return res.json({ success: true, role: "user", userId: user.id });
  }

  if (role === "agent") {
    const agents = readJSON(agentsFile);
    const agent = agents.find(a => a.username === username && a.password === password);
    if (agent) return res.json({ success: true, role: "agent", agentId: agent.id });
  }

  res.status(401).json({ success: false });
});


router.get("/signup", (req, res) => {
  const { username, password } = req.query;
  const users = readJSON(usersFile);

  const exists = users.find(u => u.username === username);
  if (exists) return res.json({ success: false });

  const newUser = { id: Date.now(), username, password };
  users.push(newUser);
  writeJSON(usersFile, users);

  res.json({ success: true, userId: newUser.id });
});


router.get("/tickets", (req, res) => {
  const tickets = readJSON(ticketsFile);
  res.json(tickets); // returns ALL tickets
});


router.post("/tickets", (req, res) => {
  const { title, type, description, userEmail } = req.body;

if (!title || !description || !userEmail) {
  return res.status(400).json({ error: "title, description, and userEmail are required" });
}

const tickets = readJSON(ticketsFile);

const newTicket = {
  id: Date.now(),      // unique ticket ID
  title,
  type: type || "General",
  description,
  userEmail,           // store email instead of userId
  status: "Open",
  messages: []
};

tickets.push(newTicket);
writeJSON(ticketsFile, tickets);

res.json(newTicket);

});

// ----------------------- ADD MESSAGE TO TICKET -----------------------
router.post("/tickets/:id/messages", (req, res) => {
  const ticketId = parseInt(req.params.id);
  const tickets = readJSON(ticketsFile);

  const ticket = tickets.find(t => t.id === ticketId);
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  const { message, agent } = req.body; // optional: agent name
  if (!message) return res.status(400).json({ error: "Message is required" });

  ticket.messages.push({ message, agent: agent || "Agent", timestamp: new Date().toISOString() });
  writeJSON(ticketsFile, tickets);

  res.json(ticket.messages);
});

// Change the message 
router.put("/tickets/:id", (req, res) => {
  const ticketId = parseInt(req.params.id);
  let tickets = readJSON(ticketsFile);

  const index = tickets.findIndex(t => t.id === ticketId);
  if(index === -1) return res.status(404).json({ error: "Ticket not found" });

  const updatedTicket = req.body;

  // Ensure ID is not changed accidentally
  updatedTicket.id = ticketId;

  tickets[index] = { ...tickets[index], ...updatedTicket }; // merge old + new
  writeJSON(ticketsFile, tickets);

  res.json({ success: true, ticket: tickets[index] });
});


// DELETE a ticket by ID
router.delete("/tickets/:id", (req, res) => {
  const ticketId = parseInt(req.params.id);
  let tickets = readJSON(ticketsFile);

  const index = tickets.findIndex(t => t.id === ticketId);
  if (index === -1) return res.status(404).json({ error: "Ticket not found" });

  tickets.splice(index, 1); // remove the ticket
  writeJSON(ticketsFile, tickets);

  res.json({ success: true, message: "Ticket deleted" });
});


module.exports = router;

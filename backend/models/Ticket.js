const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    message: { type: String, required: true, trim: true },
    authorRole: { type: String, enum: ["user", "agent"], required: true },
    authorName: { type: String, default: "", trim: true },
    internal: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
  },
  { _id: false }
);

const TicketSchema = new mongoose.Schema(
  {
    legacyId: { type: Number, unique: true, index: true },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userLegacyId: { type: Number, index: true },
    userEmail: { type: String, required: true, trim: true },

    title: { type: String, required: true, trim: true },
    type: { type: String, default: "support", trim: true }, 
    description: { type: String, required: true, trim: true },
    status: { type: String, default: "Open", trim: true }, 
    priority: { type: String, default: "Normal", trim: true }, 

    messages: { type: [MessageSchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", TicketSchema);
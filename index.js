const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Participant = require('./models/Participant');

const app = express();

// Middleware
app.use(cors()); // Allows frontend to talk to backend
app.use(express.json());

// 1. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// 2. Routes

// A. Health Check (Just to see if API is working)
app.get('/', (req, res) => {
  res.send('OSD 2026 API is Running...');
});

// B. Registration Route
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, college, year, ticketId } = req.body;

    // Check if ticket ID already exists (rare, but safe)
    const existingUser = await Participant.findOne({ ticketId });
    if (existingUser) {
      return res.status(400).json({ error: "Ticket ID already exists" });
    }

    const newParticipant = new Participant({
      name, email, phone, college, year, ticketId
    });

    await newParticipant.save();
    res.status(201).json({ message: "Registration Successful!" });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// C. The "Participant Count" Route (Your Request)
app.get('/api/count', async (req, res) => {
  try {
    const count = await Participant.countDocuments();
    res.json({ total: count });
  } catch (error) {
    res.status(500).json({ error: "Could not fetch count" });
  }
});

// Inside index.js
app.get('/', (req, res) => {
  res.send('Server is Awake!');
});

// 3. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


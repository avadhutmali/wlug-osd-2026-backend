const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Resend } = require('resend');
require('dotenv').config();

// Models
const Participant = require('./models/Participant');

// Templates
const createEmailTemplate = require('./templates/osd2k26_Invite_Boxed_Email');

const app = express();

// Middleware
app.use(cors({ origin: '*' })); // Allow all origins
app.use(express.json()); // Standard JSON limit (1mb is default, enough for text)

const resend = new Resend(process.env.RESEND_API_KEY);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.get('/', (req, res) => {
  res.send('OSD 2k26 Server is Awake!');
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, college, year, ticketId } = req.body;

    // Check Duplicate
    const existingUser = await Participant.findOne({ ticketId });
    if (existingUser) {
      return res.status(400).json({ error: "Ticket ID already exists" });
    }

    // Save User
    const newParticipant = new Participant({
      name, email, phone, college, year, ticketId
    });
    await newParticipant.save();

    // Send Email (Text Only, No Attachments)
    try {
      await resend.emails.send({
        from: 'OSD 2k26 Team <osd2k26@wcewlug.org>',
        to: [email],
        subject: '🎟️ Your Ticket for Open Source Day 2k26',
        html: createEmailTemplate(name, ticketId)
      });
      console.log(`📧 Email sent to ${email}`);
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
    }

    res.status(201).json({ message: "Registration Successful!" });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

app.get('/api/count', async (req, res) => {
  try {
    const count = await Participant.countDocuments();
    res.json({ total: count });
  } catch (error) {
    res.status(500).json({ error: "Error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
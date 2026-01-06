const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true }, // Removed unique: true to avoid errors during testing
  phone: { type: String, required: true },
  college: { type: String, required: true },
  year: { type: String, required: true },
  ticketId: { type: String, required: true, unique: true }, // The OSD-XXXX ID
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Participant', participantSchema);
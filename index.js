const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer'); // Import Nodemailer
require('dotenv').config();

const Participant = require('./models/Participant');

const app = express();

// Middleware
app.use(cors({
  origin: '*', 
  credentials: true
}));
app.use(express.json());

// 1. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// 2. Email Transporter Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or use 'smtp.host.com' for other providers
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 3. The HTML Email Template Function
const createEmailTemplate = (name, ticketId) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invitation: Open Source Day 2k26</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #18181b; font-family: 'Courier New', Courier, monospace; color: #ffffff;">
      
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            
            <table role="presentation" style="width: 600px; border-collapse: separate; background-color: #000000; border: 1px solid #333333; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
              
              <tr>
                <td style="background-color: #FF6600; padding: 4px;"></td>
              </tr>

              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 2px; color: #ffffff;">
                    OPEN SOURCE <span style="color: #FF6600;">DAY</span>
                  </h1>
                  <p style="margin: 10px 0 0 0; font-size: 14px; color: #888888; text-transform: uppercase; letter-spacing: 3px;">
                    OFFICIAL INVITATION
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding: 0 40px;">
                  <div style="border: 2px dashed #333333; border-radius: 12px; padding: 30px; background-color: #0a0a0a;">
                    
                    <p style="margin: 0 0 20px 0; color: #cccccc; font-size: 16px;">
                      Hello <strong style="color: #ffffff;">${name}</strong>,
                    </p>
                    <p style="margin: 0 0 30px 0; color: #888888; line-height: 1.6;">
                      Your registration for WLUG Open Source Day 2k26 is confirmed. We are thrilled to have you join us for a day of code, collaboration, and innovation.
                    </p>

                    <table style="width: 100%;">
                      <tr>
                        <td style="padding-bottom: 20px;">
                          <p style="margin: 0; font-size: 12px; color: #555555; text-transform: uppercase;">DATE</p>
                          <p style="margin: 5px 0 0 0; font-size: 18px; color: #ffffff; font-weight: bold;">15 AUG, 2026</p>
                        </td>
                        <td style="padding-bottom: 20px;">
                          <p style="margin: 0; font-size: 12px; color: #555555; text-transform: uppercase;">TIME</p>
                          <p style="margin: 5px 0 0 0; font-size: 18px; color: #ffffff; font-weight: bold;">09:00 AM</p>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 20px; border-top: 1px solid #333333;">
                          <p style="margin: 0; font-size: 12px; color: #555555; text-transform: uppercase;">UNIQUE ENTRY ID</p>
                          <p style="margin: 10px 0 0 0; font-size: 24px; color: #FF6600; font-weight: 900; letter-spacing: 2px;">
                            ${ticketId}
                          </p>
                        </td>
                      </tr>
                    </table>

                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px; text-align: center;">
                  <p style="color: #666666; font-size: 12px; margin-bottom: 20px;">
                    Please present the ID above or the QR code at the registration desk.
                  </p>
                  <a href="https://your-website-url.com" style="background-color: #FF6600; color: #000000; padding: 14px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
                    Visit Website
                  </a>
                </td>
              </tr>

            </table>

            <p style="margin-top: 30px; color: #444444; font-size: 12px;">
              &copy; 2026 WLUG. All systems operational.
            </p>

          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// 4. Routes

app.get('/', (req, res) => {
  res.send('Server is Awake!');
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, college, year, ticketId } = req.body;

    // Check duplicate
    const existingUser = await Participant.findOne({ ticketId });
    if (existingUser) {
      return res.status(400).json({ error: "Ticket ID already exists" });
    }

    // Save to DB
    const newParticipant = new Participant({
      name, email, phone, college, year, ticketId
    });
    await newParticipant.save();

    // --- SEND EMAIL ---
    try {
      const mailOptions = {
        from: `"WLUG OSD Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "🎟️ Your Ticket for Open Source Day 2k26",
        html: createEmailTemplate(name, ticketId)
      };

      await transporter.sendMail(mailOptions);
      console.log(`📧 Email sent to ${email}`);
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
      // We don't fail the request if email fails, just log it
    }
    // ------------------

    res.status(201).json({ message: "Registration Successful & Email Sent!" });

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
    res.status(500).json({ error: "Could not fetch count" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
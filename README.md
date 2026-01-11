# OSD 2k26 – Backend (Event Registration Platform)

This repository contains the **backend service** for the **OSD 2k26 Event Registration Platform**, developed for **Open Source Day 2k26** organized by the **Walchand Linux Users' Group (WLUG)**.

The backend is built using **Node.js and Express**, responsible for participant registration, data persistence in MongoDB, ticket ID management, and sending confirmation emails using the Resend API.

---

## Overview

The backend exposes REST APIs that:
- Register participants
- Store participant details securely in MongoDB
- Send email confirmations after successful registration
- Provide participant statistics for dashboards or admin panels

---

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- Resend API (Email Service)
- dotenv
- CORS

---

## Project Structure

```text
backend/
├── models/
│   └── Participant.js
├── routes/
│   └── register.js
├── controllers/
│   └── registerController.js
├── .env
├── index.js
├── package.json
```

---

## Prerequisites

- Node.js v18 or higher
- npm
- MongoDB (Local or Atlas)
- Resend API Key

---

## Installation

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

---

## Environment Configuration

Create a `.env` file in the `backend` root directory.

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/osd_db
RESEND_API_KEY=re_your_resend_api_key
```

---

## Database Schema

File: `models/Participant.js`

```js
const mongoose = require("mongoose");

const ParticipantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  college: { type: String },
  year: { type: String },
  ticketId: { type: String, required: true, unique: true },
  registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Participant", ParticipantSchema);
```

---

## Running the Server

```bash
npm start
```

The server will start on:

http://localhost:5000

---

## API Endpoints

### Register Participant

- Method: POST
- Endpoint: /api/register
- Description: Registers a participant, stores data in MongoDB, and sends a confirmation email.

Sample Request Body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "college": "Walchand College of Engineering",
  "year": "TY",
  "ticketId": "OSD-X7Z9P2"
}
```

---

### Get Participant Count

- Method: GET
- Endpoint: /api/count
- Description: Returns the total number of registered participants.

Sample Response:

```json
{
  "total": 150
}
```

---

## Security Notes

- Sensitive values are managed using environment variables
- CORS should be configured to allow only trusted frontend origins
- MongoDB indexes ensure unique ticket IDs

---

## Deployment Notes

- Deployed as a Web Service on Render
- Ensure environment variables are configured in the deployment dashboard
- MongoDB Atlas IP access must allow the deployment server

---

## License

This backend service is licensed under the MIT License.

---

## Maintained By

Walchand Linux Users' Group (WLUG)

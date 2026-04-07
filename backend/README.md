# GigForge Backend

This is the backend for GigForge, a hyperlocal freelance marketplace focused on Tamil Nadu.

## Features Let's implemented:
- Authentication & Authorization (JWT, bcrypt)
- Role-based Access (Client & Freelancer)
- Projects and Bidding System
- Basic Messaging System using Socket.io
- Simple Error Handling Middleware

## Tech Stack
- Node.js
- Express.js
- MongoDB / Mongoose
- Socket.io for Real-time chat

## Setup Instructions

1. **Clone the repository** (if applicable) or navigate to the `backend` folder.

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Rename `.env.example` to `.env` and fill in your connection variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/gigforge
   JWT_SECRET=your_jwt_secret_key_here
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

4. **Run the server**
   ```bash
   node server.js
   ```
   Or for development mode:
   ```bash
   npx nodemon server.js
   ```

## Folder Structure

- `server.js` - Application entry point, server setup, socket.io configuration.
- `config/` - Database connection and configuration.
- `models/` - Mongoose schemas (User, Project, Bid, Message).
- `controllers/` - Application logic for different routes.
- `routes/` - Express routing definitions.
- `middleware/` - Custom middleware for auth and error handling.

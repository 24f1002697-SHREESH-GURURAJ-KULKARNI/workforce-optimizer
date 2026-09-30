// Load environment variables from backend/.env before using process.env.
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Create the Express application.
const app = express();

// Allow cross-origin requests and parse JSON bodies.
app.use(cors());
app.use(express.json());

// Health check endpoint.
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Mount the employee routes so the API can create, read, update, and delete employees.
app.use('/api/employees', require('./routes/employees'));
// Mount the project routes so the API can create, read, update, and delete projects.
app.use('/api/projects', require('./routes/projects'));

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start the server.
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
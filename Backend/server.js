require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./cofig/db');
const userRoutes = require('./routes/userRoute');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Database connection
connectDB();

// Routes
app.use('/api/users', userRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('MERN Backend with Clerk Integration');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'Afia-Connect API is running' });
});

// Error handling middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { verifyRequest } = require('./middleware');
require('dotenv').config();
const {User} = require('./models/userSchema');
const {MonitoringDataSchema} = require('./models/database');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS.split(','), // Allow requests only from specified origins
    credentials: true // Allow sending cookies in cross-origin requests
}));
app.use(express.json()); // Parses incoming JSON request bodies
app.use(cookieParser()); // Parses cookies from incoming requests

app.use(verifyRequest());
// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Routes
app.use('/api', require('./routes/monitorroutes'));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
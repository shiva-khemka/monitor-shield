// server.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
//import { verifyRequest } from './middleware.js';
import monitorRoutes from './routes/monitorroutes.js';

dotenv.config();

const app = express();
const port =  5001;

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(','), // Allow requests only from specified origins
    credentials: true // Allow sending cookies in cross-origin requests
}));

app.use(express.json()); // Parses incoming JSON request bodies
app.use(cookieParser()); // Parses cookies from incoming requests

// Apply verifyRequest middleware to specific routes that need it
// Instead of app.use(verifyRequest())
app.use('/collect', monitorRoutes);

// MongoDB connection
mongoose.connect('mongodb+srv://shivakhemka:WtChg00eMArlAA25@cluster0.dz71b.mongodb.net/?retryWrites=true&w=majority')
  .then(() => console.log('Database connected.'))
  .catch(err => console.error('Connection error:', err));


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export default app;
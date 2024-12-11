import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({
    hashedId: { type: String, required: true, unique: true },
    trustScore: { type: Number, default: 50 },
    createdAt: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now }
});
export const User = mongoose.model('User', UserSchema);
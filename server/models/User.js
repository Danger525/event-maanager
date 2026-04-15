const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin', 'organizer'], default: 'student' },
    department: { type: String, default: 'General' },
    year: { type: String, default: '1st Year' },
    interests: [{ type: String }],
    savedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    attendance: { type: Number, default: 0 },
    notifications: [{
        type: { type: String, enum: ['event', 'registration', 'priority', 'reminder'] },
        title: { type: String, required: true },
        message: { type: String, required: true },
        read: { type: Boolean, default: false },
        timestamp: { type: Date, default: Date.now },
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }
    }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

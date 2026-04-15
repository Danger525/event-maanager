const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    isOnline: { type: Boolean, default: false },
    onlineLink: { type: String },
    departments: [{ type: String }], // e.g., ['Computer Science', 'Electronics']
    targetYears: [{ type: String }], // e.g., ['3rd Year', '4th Year']
    category: { 
        type: String, 
        required: true, 
        enum: ['Workshop', 'Seminar', 'Placement', 'Cultural', 'Sports', 'Competition', 'Others'] 
    },
    priority: { 
        type: String, 
        required: true, 
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },
    registrationDeadline: { type: Date },
    imageUrl: { type: String },
    organizer: { type: String, required: true },
    registeredCount: { type: Number, default: 0 },
    capacity: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);

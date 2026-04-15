const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Event = require('../models/Event');
const connectDB = require('../config/db');

const seedAnalytics = async () => {
    try {
        await connectDB();
        
        // Clear existing events for a clean analytics view (optional, but better for demonstration)
        // await Event.deleteMany({}); 

        const categories = ['Workshop', 'Seminar', 'Placement', 'Cultural', 'Sports', 'Competition', 'Others'];
        const departments = ['CSE', 'ECE', 'ME', 'EE', 'CIVIL', 'BCA'];
        
        const events = [];
        const now = new Date();
        
        // Generate events for the last 7 days
        for (let i = 0; i < 20; i++) {
            const daysAgo = Math.floor(Math.random() * 7);
            const date = new Date(now);
            date.setDate(now.getDate() - daysAgo);
            
            // Random creation date for trends
            const createdAt = new Date(date);
            createdAt.setHours(Math.floor(Math.random() * 24));

            events.push({
                title: `Sample Event ${i + 1}`,
                description: `Description for sample event ${i + 1}`,
                category: categories[Math.floor(Math.random() * categories.length)],
                priority: Math.random() > 0.5 ? 'high' : 'medium',
                date: date,
                time: '14:00',
                venue: 'Main Auditorium', // Changed from location
                organizer: 'Campus Events Team',
                departments: [departments[Math.floor(Math.random() * departments.length)]],
                registeredCount: Math.floor(Math.random() * 50) + 10,
                capacity: 100,
                imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60', // Changed from image
                createdAt: createdAt
            });
        }

        await Event.insertMany(events);
        console.log('✅ Successfully seeded 20 sample events for analytics!');
        process.exit();
    } catch (err) {
        console.error('❌ Error seeding analytics data:', err);
        process.exit(1);
    }
};

seedAnalytics();

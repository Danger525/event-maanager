require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    console.log('Cleared existing data.');

    // Create Admin User
    const admin = await User.create({
      username: 'admin',
      email: 'admin@campus.edu',
      password: 'password123',
      role: 'admin',
      department: 'Administration',
      year: 'N/A',
      interests: ['Management', 'Technology']
    });
    console.log('Admin user created: admin@campus.edu / password123');

    // Create Student User
    const student = await User.create({
      username: 'student',
      email: 'student@campus.edu',
      password: 'password123',
      role: 'student',
      department: 'Computer Science',
      year: '3rd Year',
      interests: ['Coding', 'Hackathons', 'Music']
    });
    console.log('Student user created: student@campus.edu / password123');

    // Sample Events
    const events = [
      {
        title: 'TechVision 2026 Hackathon',
        description: 'A 24-hour hackathon to solve real-world problems. Prizes worth $5000 up for grabs.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        time: '09:00 AM',
        venue: 'Main Auditorium',
        isOnline: false,
        departments: ['Computer Science', 'Electronics'],
        targetYears: ['3rd Year', '4th Year'],
        category: 'Competition',
        priority: 'high',
        registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        organizer: 'Computer Society',
        registeredCount: 45,
        capacity: 100
      },
      {
        title: 'Modern Web Architecture Seminar',
        description: 'Learn about Microservices, Edge Computing, and State-of-the-Art Web Frameworks.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        time: '02:00 PM',
        venue: 'Virtual - Zoom',
        isOnline: true,
        onlineLink: 'https://zoom.us/j/123456789',
        departments: ['Computer Science', 'Information Technology'],
        targetYears: ['2nd Year', '3rd Year', '4th Year'],
        category: 'Seminar',
        priority: 'medium',
        registrationDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        organizer: 'Google Developer Group',
        registeredCount: 120,
        capacity: 200
      },
      {
        title: 'Campus Cultural Fest - Rhythm 2026',
        description: 'Annual cultural festival with dance, music, and drama performances.',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        time: '06:00 PM',
        venue: 'Campus Open Grounds',
        isOnline: false,
        departments: ['All Departments'],
        targetYears: ['All Years'],
        category: 'Cultural',
        priority: 'high',
        registrationDeadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        organizer: 'Arts Council',
        registeredCount: 500,
        capacity: 1000
      },
      {
        title: 'Career Builders Workshop',
        description: 'Resume building and interview preparation workshop with industry experts.',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        time: '11:00 AM',
        venue: 'Placement Cell Hall',
        isOnline: false,
        departments: ['Mechanical', 'Civil', 'Electronics'],
        targetYears: ['4th Year'],
        category: 'Workshop',
        priority: 'medium',
        registrationDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        organizer: 'Training & Placement Office',
        registeredCount: 30,
        capacity: 50
      },
      {
        title: 'Inter-College Chess Championship',
        description: 'Show your strategic skills in the annual chess tournament.',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Past event
        time: '10:00 AM',
        venue: 'Student Lounge',
        isOnline: false,
        departments: ['All Departments'],
        targetYears: ['All Years'],
        category: 'Sports',
        priority: 'low',
        registrationDeadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        organizer: 'Sports Club',
        registeredCount: 64,
        capacity: 64
      }
    ];

    await Event.insertMany(events);
    console.log(`${events.length} events seeded successfully.`);

    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();

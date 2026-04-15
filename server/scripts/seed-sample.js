require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');

async function main() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not set');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const passwordHash = await bcrypt.hash('Test@12345', 10);

    const testUser = await User.findOneAndUpdate(
      { email: 'mongodb-test@campus.edu' },
      {
        $set: {
          username: 'mongodb_test_user',
          password: passwordHash,
          role: 'student',
          department: 'Computer Science',
          year: '3rd Year',
          interests: ['MongoDB', 'Backend', 'Testing'],
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const testEvent = await Event.findOneAndUpdate(
      { title: 'MongoDB Connection Test Event' },
      {
        $set: {
          description: 'A small event inserted to verify the backend can write to MongoDB Atlas.',
          date: new Date(),
          time: '10:00 AM',
          venue: 'Online',
          isOnline: true,
          onlineLink: 'https://example.com/mongodb-test',
          departments: ['Computer Science'],
          targetYears: ['3rd Year'],
          category: 'Workshop',
          priority: 'low',
          registrationDeadline: new Date(),
          organizer: 'Codex',
          registeredCount: 1,
          capacity: 25,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('Test user upserted:', testUser.email);
    console.log('Test event upserted:', testEvent.title);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

main();

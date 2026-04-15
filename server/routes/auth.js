const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    const { username, email, password, department, year, interests } = req.body;

    try {
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            username,
            email,
            password,
            department,
            year,
            interests
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                department: user.department,
                year: user.year,
                interests: user.interests,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const { protect } = require('../middleware/auth');

// @desc    Get user profile
// @route   GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            department: user.department,
            year: user.year,
            interests: user.interests,
            attendance: user.attendance,
            savedEvents: user.savedEvents,
            registeredEvents: user.registeredEvents
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Update user profile
// @route   PATCH /api/auth/profile
router.patch('/profile', protect, async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        user.department = req.body.department || user.department;
        user.year = req.body.year || user.year;
        user.interests = req.body.interests || user.interests;
        
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            department: updatedUser.department,
            year: updatedUser.year,
            interests: updatedUser.interests,
            token: generateToken(updatedUser._id)
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Get user notifications
// @route   GET /api/auth/notifications
router.get('/notifications', protect, async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json(user.notifications);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Mark notification as read
// @route   PATCH /api/auth/notifications/:id/read
router.patch('/notifications/:id/read', protect, async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        const notification = user.notifications.id(req.params.id);
        if (notification) {
            notification.read = true;
            await user.save();
            res.json({ message: 'Notification marked as read' });
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

module.exports = router;

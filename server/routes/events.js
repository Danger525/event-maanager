const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// @desc    Get all events
// @route   GET /api/events
router.get('/', async (req, res) => {
    try {
        const { category, priority, department, q } = req.query;
        let query = {};

        if (category && category !== 'all') query.category = category;
        if (priority && priority !== 'all') query.priority = priority;
        if (department && department !== 'all') {
            query.departments = { $in: [department, 'All Departments'] };
        }
        if (q) {
            query.$or = [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ];
        }

        const events = await Event.find(query).sort({ date: 1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Get single event
// @route   GET /api/events/:id
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (event) {
            res.json(event);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Create an event
// @route   POST /api/events
router.post('/', protect, admin, async (req, res) => {
    try {
        const event = new Event(req.body);
        const createdEvent = await event.save();
        res.status(201).json(createdEvent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @desc    Get analytics for admin
// @route   GET /api/events/analytics
router.get('/analytics', protect, admin, async (req, res) => {
    try {
        const stats = await Event.aggregate([
            {
                $group: {
                    _id: null,
                    totalRegistrations: { $sum: "$registeredCount" },
                    totalEvents: { $sum: 1 },
                    activeEvents: { 
                        $sum: { $cond: [{ $gte: ["$date", new Date()] }, 1, 0] } 
                    }
                }
            }
        ]);

        const categorySplit = await Event.aggregate([
            {
                $group: {
                    _id: "$category",
                    value: { $sum: 1 }
                }
            },
            { $project: { name: "$_id", value: 1, _id: 0 } }
        ]);

        const departmentSplit = await Event.aggregate([
            { $unwind: "$departments" },
            {
                $group: {
                    _id: "$departments",
                    value: { $sum: 1 }
                }
            },
            { $project: { name: "$_id", value: 1, _id: 0 } }
        ]);

        const trends = await Event.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%a", date: "$createdAt" } },
                    registrations: { $sum: "$registeredCount" }
                }
            },
            { $limit: 7 },
            { $project: { name: "$_id", registrations: 1, _id: 0 } }
        ]);

        res.json({
            stats: stats[0] || { totalRegistrations: 0, totalEvents: 0, activeEvents: 0 },
            categorySplit,
            departmentSplit,
            trends
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Get user's registered events
// @route   GET /api/events/my/registered
router.get('/my/registered', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('registeredEvents');
        res.json(user.registeredEvents);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Update an event
// @route   PUT /api/events/:id
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (event) {
            Object.assign(event, req.body);
            const updatedEvent = await event.save();
            res.json(updatedEvent);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (event) {
            await event.deleteOne();
            res.json({ message: 'Event removed' });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Register for an event
// @route   POST /api/events/:id/register
router.post('/:id/register', protect, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        const user = await User.findById(req.user._id);

        if (!event) return res.status(404).json({ message: 'Event not found' });
        
        // Check capacity
        if (event.capacity && event.registeredCount >= event.capacity) {
            return res.status(400).json({ message: 'Event is already at full capacity' });
        }

        if (user.registeredEvents.includes(event._id)) {
            return res.status(400).json({ message: 'Already registered' });
        }

        user.registeredEvents.push(event._id);
        event.registeredCount += 1;

        // Add notification
        user.notifications.push({
            type: 'registration',
            title: 'Registration Successful',
            message: `You have successfully registered for ${event.title}.`,
            eventId: event._id
        });

        await user.save();
        await event.save();

        res.json({ message: 'Successfully registered' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Save an event
// @route   POST /api/events/:id/save
router.post('/:id/save', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const isRemoving = user.savedEvents.includes(req.params.id);
        
        if (isRemoving) {
            user.savedEvents = user.savedEvents.filter(id => id.toString() !== req.params.id);
        } else {
            user.savedEvents.push(req.params.id);
            // Optional: Add notification for saving? (Maybe too much, but let's stick to the plan)
        }
        
        await user.save();
        res.json({ 
            message: isRemoving ? 'Event removed from saved list' : 'Event saved',
            isSaved: !isRemoving
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

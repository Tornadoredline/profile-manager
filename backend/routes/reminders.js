const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reminders
// @desc    Get all reminders for current user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [reminders] = await db.query(
      `SELECT r.*, p.site_name, p.status 
       FROM reminders r
       LEFT JOIN profiles p ON r.profile_id = p.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json(reminders);
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   GET /api/reminders/pending
// @desc    Get pending reminders for current user
// @access  Private
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const [reminders] = await db.query(
      `SELECT r.*, p.site_name, p.status 
       FROM reminders r
       LEFT JOIN profiles p ON r.profile_id = p.id
       WHERE r.user_id = ? AND r.status = 'pending'
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json(reminders);
  } catch (error) {
    console.error('Get pending reminders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   POST /api/reminders
// @desc    Create a reminder
// @access  Private
router.post('/', [
  authMiddleware,
  body('profile_id').isInt().withMessage('Profile ID is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('reminder_date').isISO8601().withMessage('Valid reminder date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { profile_id, message, reminder_date } = req.body;

    const [result] = await db.query(
      `INSERT INTO reminders (user_id, profile_id, message, reminder_date, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [req.user.id, profile_id, message, reminder_date]
    );

    res.status(201).json({
      message: 'Reminder created successfully',
      reminder: {
        id: result.insertId,
        user_id: req.user.id,
        profile_id,
        message,
        reminder_date,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   PUT /api/reminders/:id/dismiss
// @desc    Dismiss a reminder
// @access  Private
router.put('/:id/dismiss', authMiddleware, async (req, res) => {
  try {
    const reminderId = req.params.id;

    const [reminders] = await db.query(
      'SELECT id FROM reminders WHERE id = ? AND user_id = ?',
      [reminderId, req.user.id]
    );

    if (reminders.length === 0) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    await db.query(
      'UPDATE reminders SET status = "dismissed" WHERE id = ?',
      [reminderId]
    );

    res.json({ message: 'Reminder dismissed successfully' });

  } catch (error) {
    console.error('Dismiss reminder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   DELETE /api/reminders/:id
// @desc    Delete a reminder
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const reminderId = req.params.id;

    const [reminders] = await db.query(
      'SELECT id FROM reminders WHERE id = ? AND user_id = ?',
      [reminderId, req.user.id]
    );

    if (reminders.length === 0) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    await db.query('DELETE FROM reminders WHERE id = ?', [reminderId]);

    res.json({ message: 'Reminder deleted successfully' });

  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
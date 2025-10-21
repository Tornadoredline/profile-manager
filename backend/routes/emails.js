const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

// @route   GET /api/emails
// @desc    Get all emails with pagination
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM emails WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (email LIKE ? OR notes LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Get total count
    const [countResult] = await db.query(
      sql.replace('SELECT *', 'SELECT COUNT(*) as total'),
      params
    );

    // Get emails with pagination
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [emails] = await db.query(sql, params);

    res.json({
      emails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get emails error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   GET /api/emails/stats
// @desc    Get email statistics
// @access  Private
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'free' THEN 1 ELSE 0 END) as free,
        SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END) as used,
        SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked
      FROM emails
    `);

    res.json(stats[0]);
  } catch (error) {
    console.error('Get email stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   GET /api/emails/available
// @desc    Get available email for assignment
// @access  Private
router.get('/available', authMiddleware, async (req, res) => {
  try {
    const [emails] = await db.query(
      'SELECT * FROM emails WHERE status = "free" LIMIT 1'
    );

    if (emails.length === 0) {
      return res.status(404).json({ error: 'No available emails' });
    }

    res.json(emails[0]);
  } catch (error) {
    console.error('Get available email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   POST /api/emails
// @desc    Create a new email (Admin only)
// @access  Private/Admin
router.post('/', [
  authMiddleware,
  roleMiddleware(['admin']),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, notes } = req.body;

    // Check if email exists
    const [existingEmails] = await db.query(
      'SELECT id FROM emails WHERE email = ?',
      [email]
    );

    if (existingEmails.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Insert email
    const [result] = await db.query(
      'INSERT INTO emails (email, password, notes, status) VALUES (?, ?, ?, "free")',
      [email, password, notes]
    );

    res.status(201).json({
      message: 'Email created successfully',
      email: {
        id: result.insertId,
        email,
        password,
        notes,
        status: 'free'
      }
    });

  } catch (error) {
    console.error('Create email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   POST /api/emails/bulk
// @desc    Create multiple emails (Admin only)
// @access  Private/Admin
router.post('/bulk', [
  authMiddleware,
  roleMiddleware(['admin']),
  body('emails').isArray({ min: 1 }).withMessage('Emails array is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { emails } = req.body;
    const results = {
      successful: [],
      failed: []
    };

    for (const emailData of emails) {
      try {
        const { email, password, notes } = emailData;

        // Check if email exists
        const [existingEmails] = await db.query(
          'SELECT id FROM emails WHERE email = ?',
          [email]
        );

        if (existingEmails.length > 0) {
          results.failed.push({
            email,
            error: 'Email already exists'
          });
          continue;
        }

        // Insert email
        const [result] = await db.query(
          'INSERT INTO emails (email, password, notes, status) VALUES (?, ?, ?, "free")',
          [email, password, notes]
        );

        results.successful.push({
          id: result.insertId,
          email,
          password,
          notes,
          status: 'free'
        });

      } catch (error) {
        results.failed.push({
          email: emailData.email,
          error: error.message
        });
      }
    }

    res.status(201).json({
      message: 'Bulk email creation completed',
      results
    });

  } catch (error) {
    console.error('Bulk create emails error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   PUT /api/emails/:id
// @desc    Update an email (Admin only)
// @access  Private/Admin
router.put('/:id', [
  authMiddleware,
  roleMiddleware(['admin']),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('status').optional().isIn(['free', 'used', 'blocked']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const emailId = req.params.id;
    const { email, password, status, notes } = req.body;

    // Check if email exists
    const [emails] = await db.query(
      'SELECT id FROM emails WHERE id = ?',
      [emailId]
    );

    if (emails.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Build update fields
    const updateFields = {};
    const updateValues = [];

    if (email) {
      updateFields.email = email;
      updateValues.push(email);
    }

    if (password) {
      updateFields.password = password;
      updateValues.push(password);
    }

    if (status) {
      updateFields.status = status;
      updateValues.push(status);
    }

    if (notes !== undefined) {
      updateFields.notes = notes;
      updateValues.push(notes);
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Construct SQL
    const setClause = Object.keys(updateFields)
      .map(field => `${field} = ?`)
      .join(', ');

    const sql = `UPDATE emails SET ${setClause} WHERE id = ?`;
    updateValues.push(emailId);

    await db.query(sql, updateValues);

    res.json({ message: 'Email updated successfully' });

  } catch (error) {
    console.error('Update email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   DELETE /api/emails/:id
// @desc    Delete an email (Admin only)
// @access  Private/Admin
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const emailId = req.params.id;

    // Check if email exists
    const [emails] = await db.query(
      'SELECT id FROM emails WHERE id = ?',
      [emailId]
    );

    if (emails.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Check if email is used in profiles
    const [profiles] = await db.query(
      'SELECT id FROM profiles WHERE assigned_email = (SELECT email FROM emails WHERE id = ?) LIMIT 1',
      [emailId]
    );

    if (profiles.length > 0) {
      return res.status(400).json({ error: 'Cannot delete email used in profiles' });
    }

    // Delete email
    await db.query('DELETE FROM emails WHERE id = ?', [emailId]);

    res.json({ message: 'Email deleted successfully' });

  } catch (error) {
    console.error('Delete email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
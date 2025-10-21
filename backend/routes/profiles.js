const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

// @route   GET /api/profiles
// @desc    Get profiles for current user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.role;

    let sql = `
      SELECT p.*, c.name as category_name, c.type as category_type 
      FROM profiles p 
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // For regular users, only show their own profiles
    // For admins, show all profiles
    if (userRole !== 'admin') {
      sql += ' AND p.user_id = ?';
      params.push(userId);
    }

    if (category) {
      sql += ' AND c.type = ?';
      params.push(category);
    }

    if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (p.site_name LIKE ? OR p.username LIKE ? OR p.comments LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY p.created_at DESC';

    const [profiles] = await db.query(sql, params);

    res.json(profiles);
  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   POST /api/profiles
// @desc    Create a new profile
// @access  Private
router.post('/', [
  authMiddleware,
  body('site_name').notEmpty().withMessage('Site name is required'),
  body('category_id').isInt().withMessage('Category ID must be an integer'),
  body('status').notEmpty().withMessage('Status is required'),
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      site_name,
      category_id,
      status,
      username,
      password,
      verification_status,
      phone,
      registration_status,
      registration_country,
      ip_country,
      comments
    } = req.body;

    const userId = req.user.userId;

    // Check if category exists
    const [categories] = await db.query(
      'SELECT id, type FROM categories WHERE id = ?',
      [category_id]
    );

    if (categories.length === 0) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // For "for_sale" category, assign an available email automatically
    let assignedEmail = null;
    if (categories[0].type === 'for_sale') {
      const [emails] = await db.query(
        'SELECT id, email FROM emails WHERE status = "free" LIMIT 1'
      );

      if (emails.length > 0) {
        assignedEmail = emails[0].email;
        
        // Mark email as used
        await db.query(
          'UPDATE emails SET status = "used", used_at = NOW() WHERE id = ?',
          [emails[0].id]
        );
      }
    }

    // Insert profile
    const [result] = await db.query(
      `INSERT INTO profiles (
        user_id, category_id, site_name, status, username, password,
        verification_status, phone, registration_status, registration_country,
        ip_country, comments, assigned_email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, category_id, site_name, status, username, password,
        verification_status, phone, registration_status, registration_country,
        ip_country, comments, assignedEmail
      ]
    );

    // Get the created profile with category info
    const [profiles] = await db.query(
      `SELECT p.*, c.name as category_name, c.type as category_type 
       FROM profiles p 
       JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [result.insertId]
    );

    // Emit real-time notification for admins about new profile
    const io = req.app.get('io');
    if (io) {
      io.emit('new-profile', {
        profile: profiles[0],
        user: req.user
      });
    }

    res.status(201).json(profiles[0]);

  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   PUT /api/profiles/:id
// @desc    Update a profile
// @access  Private
router.put('/:id', [
  authMiddleware,
  body('site_name').optional().notEmpty().withMessage('Site name cannot be empty'),
  body('status').optional().notEmpty().withMessage('Status cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const profileId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check if profile exists and user has permission
    let sql = 'SELECT * FROM profiles WHERE id = ?';
    const params = [profileId];

    if (userRole !== 'admin') {
      sql += ' AND user_id = ?';
      params.push(userId);
    }

    const [profiles] = await db.query(sql, params);

    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const {
      site_name,
      status,
      username,
      password,
      verification_status,
      phone,
      registration_status,
      registration_country,
      ip_country,
      comments
    } = req.body;

    // Build update fields
    const updateFields = {};
    const updateValues = [];

    if (site_name) {
      updateFields.site_name = site_name;
      updateValues.push(site_name);
    }

    if (status) {
      updateFields.status = status;
      updateValues.push(status);
    }

    if (username) {
      updateFields.username = username;
      updateValues.push(username);
    }

    if (password) {
      updateFields.password = password;
      updateValues.push(password);
    }

    if (verification_status !== undefined) {
      updateFields.verification_status = verification_status;
      updateValues.push(verification_status);
    }

    if (phone !== undefined) {
      updateFields.phone = phone;
      updateValues.push(phone);
    }

    if (registration_status !== undefined) {
      updateFields.registration_status = registration_status;
      updateValues.push(registration_status);
    }

    if (registration_country !== undefined) {
      updateFields.registration_country = registration_country;
      updateValues.push(registration_country);
    }

    if (ip_country !== undefined) {
      updateFields.ip_country = ip_country;
      updateValues.push(ip_country);
    }

    if (comments !== undefined) {
      updateFields.comments = comments;
      updateValues.push(comments);
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Construct SQL
    const setClause = Object.keys(updateFields)
      .map(field => `${field} = ?`)
      .join(', ');

    const updateSql = `UPDATE profiles SET ${setClause}, updated_at = NOW() WHERE id = ?`;
    updateValues.push(profileId);

    await db.query(updateSql, updateValues);

    // Get updated profile
    const [updatedProfiles] = await db.query(
      `SELECT p.*, c.name as category_name, c.type as category_type 
       FROM profiles p 
       JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [profileId]
    );

    res.json(updatedProfiles[0]);

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   DELETE /api/profiles/:id
// @desc    Delete a profile
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const profileId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check if profile exists and user has permission
    let sql = 'SELECT * FROM profiles WHERE id = ?';
    const params = [profileId];

    if (userRole !== 'admin') {
      sql += ' AND user_id = ?';
      params.push(userId);
    }

    const [profiles] = await db.query(sql, params);

    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Delete profile
    await db.query('DELETE FROM profiles WHERE id = ?', [profileId]);

    res.json({ message: 'Profile deleted successfully' });

  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
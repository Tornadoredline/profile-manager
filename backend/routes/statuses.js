const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

// @route   GET /api/statuses
// @desc    Get all statuses
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [statuses] = await db.query(`
      SELECT * FROM statuses 
      ORDER BY category_type, display_order
    `);

    res.json(statuses);
  } catch (error) {
    console.error('Get statuses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   GET /api/statuses/:categoryType
// @desc    Get statuses by category type
// @access  Private
router.get('/:categoryType', authMiddleware, async (req, res) => {
  try {
    const { categoryType } = req.params;

    const [statuses] = await db.query(
      'SELECT * FROM statuses WHERE category_type = ? ORDER BY display_order',
      [categoryType]
    );

    res.json(statuses);
  } catch (error) {
    console.error('Get statuses by category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   POST /api/statuses
// @desc    Create a status (Admin only)
// @access  Private/Admin
router.post('/', [
  authMiddleware,
  roleMiddleware(['admin']),
  body('name').notEmpty().withMessage('Status name is required'),
  body('category_type').isIn(['personal', 'for_sale']).withMessage('Invalid category type'),
  body('color').notEmpty().withMessage('Color is required'),
  body('icon').notEmpty().withMessage('Icon is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      category_type,
      color,
      icon,
      display_order = 0,
      description = null
    } = req.body;

    // Check if status exists for this category
    const [existingStatuses] = await db.query(
      'SELECT id FROM statuses WHERE name = ? AND category_type = ?',
      [name, category_type]
    );

    if (existingStatuses.length > 0) {
      return res.status(400).json({ error: 'Status already exists for this category' });
    }

    // Insert status
    const [result] = await db.query(
      `INSERT INTO statuses 
       (name, category_type, color, icon, display_order, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, category_type, color, icon, display_order, description]
    );

    res.status(201).json({
      message: 'Status created successfully',
      status: {
        id: result.insertId,
        name,
        category_type,
        color,
        icon,
        display_order,
        description
      }
    });

  } catch (error) {
    console.error('Create status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   PUT /api/statuses/:id
// @desc    Update a status (Admin only)
// @access  Private/Admin
router.put('/:id', [
  authMiddleware,
  roleMiddleware(['admin']),
  body('name').optional().notEmpty().withMessage('Status name cannot be empty'),
  body('color').optional().notEmpty().withMessage('Color cannot be empty'),
  body('icon').optional().notEmpty().withMessage('Icon cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const statusId = req.params.id;
    const {
      name,
      color,
      icon,
      display_order,
      description
    } = req.body;

    // Check if status exists
    const [statuses] = await db.query(
      'SELECT id FROM statuses WHERE id = ?',
      [statusId]
    );

    if (statuses.length === 0) {
      return res.status(404).json({ error: 'Status not found' });
    }

    // Build update fields
    const updateFields = {};
    const updateValues = [];

    if (name) {
      updateFields.name = name;
      updateValues.push(name);
    }

    if (color) {
      updateFields.color = color;
      updateValues.push(color);
    }

    if (icon) {
      updateFields.icon = icon;
      updateValues.push(icon);
    }

    if (display_order !== undefined) {
      updateFields.display_order = display_order;
      updateValues.push(display_order);
    }

    if (description !== undefined) {
      updateFields.description = description;
      updateValues.push(description);
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Construct SQL
    const setClause = Object.keys(updateFields)
      .map(field => `${field} = ?`)
      .join(', ');

    const sql = `UPDATE statuses SET ${setClause} WHERE id = ?`;
    updateValues.push(statusId);

    await db.query(sql, updateValues);

    res.json({ message: 'Status updated successfully' });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   DELETE /api/statuses/:id
// @desc    Delete a status (Admin only)
// @access  Private/Admin
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const statusId = req.params.id;

    // Check if status exists
    const [statuses] = await db.query(
      'SELECT id FROM statuses WHERE id = ?',
      [statusId]
    );

    if (statuses.length === 0) {
      return res.status(404).json({ error: 'Status not found' });
    }

    // Check if status is used in profiles
    const [profiles] = await db.query(
      'SELECT id FROM profiles WHERE status = (SELECT name FROM statuses WHERE id = ?) LIMIT 1',
      [statusId]
    );

    if (profiles.length > 0) {
      return res.status(400).json({ error: 'Cannot delete status used in profiles' });
    }

    // Delete status
    await db.query('DELETE FROM statuses WHERE id = ?', [statusId]);

    res.json({ message: 'Status deleted successfully' });

  } catch (error) {
    console.error('Delete status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
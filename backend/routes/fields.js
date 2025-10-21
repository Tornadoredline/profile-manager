const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

// @route   GET /api/fields
// @desc    Get all custom fields
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [fields] = await db.query(`
      SELECT * FROM custom_fields 
      ORDER BY category_type, display_order
    `);

    res.json(fields);
  } catch (error) {
    console.error('Get fields error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   GET /api/fields/:categoryType
// @desc    Get fields by category type
// @access  Private
router.get('/:categoryType', authMiddleware, async (req, res) => {
  try {
    const { categoryType } = req.params;

    const [fields] = await db.query(
      'SELECT * FROM custom_fields WHERE category_type = ? ORDER BY display_order',
      [categoryType]
    );

    res.json(fields);
  } catch (error) {
    console.error('Get fields by category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   POST /api/fields
// @desc    Create a custom field (Admin only)
// @access  Private/Admin
router.post('/', [
  authMiddleware,
  roleMiddleware(['admin']),
  body('name').notEmpty().withMessage('Field name is required'),
  body('type').isIn(['text', 'number', 'select', 'date', 'textarea']).withMessage('Invalid field type'),
  body('category_type').isIn(['personal', 'for_sale']).withMessage('Invalid category type'),
  body('display_order').isInt({ min: 0 }).withMessage('Display order must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      type,
      category_type,
      display_order,
      is_required = false,
      options = null,
      description = null
    } = req.body;

    // Check if field exists for this category
    const [existingFields] = await db.query(
      'SELECT id FROM custom_fields WHERE name = ? AND category_type = ?',
      [name, category_type]
    );

    if (existingFields.length > 0) {
      return res.status(400).json({ error: 'Field already exists for this category' });
    }

    // Insert field
    const [result] = await db.query(
      `INSERT INTO custom_fields 
       (name, type, category_type, display_order, is_required, options, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, type, category_type, display_order, is_required, JSON.stringify(options), description]
    );

    res.status(201).json({
      message: 'Field created successfully',
      field: {
        id: result.insertId,
        name,
        type,
        category_type,
        display_order,
        is_required,
        options,
        description
      }
    });

  } catch (error) {
    console.error('Create field error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   PUT /api/fields/:id
// @desc    Update a custom field (Admin only)
// @access  Private/Admin
router.put('/:id', [
  authMiddleware,
  roleMiddleware(['admin']),
  body('name').optional().notEmpty().withMessage('Field name cannot be empty'),
  body('type').optional().isIn(['text', 'number', 'select', 'date', 'textarea']).withMessage('Invalid field type'),
  body('display_order').optional().isInt({ min: 0 }).withMessage('Display order must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const fieldId = req.params.id;
    const {
      name,
      type,
      display_order,
      is_required,
      options,
      description
    } = req.body;

    // Check if field exists
    const [fields] = await db.query(
      'SELECT id FROM custom_fields WHERE id = ?',
      [fieldId]
    );

    if (fields.length === 0) {
      return res.status(404).json({ error: 'Field not found' });
    }

    // Build update fields
    const updateFields = {};
    const updateValues = [];

    if (name) {
      updateFields.name = name;
      updateValues.push(name);
    }

    if (type) {
      updateFields.type = type;
      updateValues.push(type);
    }

    if (display_order !== undefined) {
      updateFields.display_order = display_order;
      updateValues.push(display_order);
    }

    if (is_required !== undefined) {
      updateFields.is_required = is_required;
      updateValues.push(is_required);
    }

    if (options !== undefined) {
      updateFields.options = JSON.stringify(options);
      updateValues.push(JSON.stringify(options));
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

    const sql = `UPDATE custom_fields SET ${setClause} WHERE id = ?`;
    updateValues.push(fieldId);

    await db.query(sql, updateValues);

    res.json({ message: 'Field updated successfully' });

  } catch (error) {
    console.error('Update field error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   PUT /api/fields/:id/order
// @desc    Update field display order (Admin only)
// @access  Private/Admin
router.put('/:id/order', [
  authMiddleware,
  roleMiddleware(['admin']),
  body('display_order').isInt({ min: 0 }).withMessage('Display order must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const fieldId = req.params.id;
    const { display_order } = req.body;

    // Check if field exists
    const [fields] = await db.query(
      'SELECT id FROM custom_fields WHERE id = ?',
      [fieldId]
    );

    if (fields.length === 0) {
      return res.status(404).json({ error: 'Field not found' });
    }

    await db.query(
      'UPDATE custom_fields SET display_order = ? WHERE id = ?',
      [display_order, fieldId]
    );

    res.json({ message: 'Field order updated successfully' });

  } catch (error) {
    console.error('Update field order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   DELETE /api/fields/:id
// @desc    Delete a custom field (Admin only)
// @access  Private/Admin
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const fieldId = req.params.id;

    // Check if field exists
    const [fields] = await db.query(
      'SELECT id FROM custom_fields WHERE id = ?',
      [fieldId]
    );

    if (fields.length === 0) {
      return res.status(404).json({ error: 'Field not found' });
    }

    // Delete field
    await db.query('DELETE FROM custom_fields WHERE id = ?', [fieldId]);

    res.json({ message: 'Field deleted successfully' });

  } catch (error) {
    console.error('Delete field error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
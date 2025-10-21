const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT * FROM categories ORDER BY name'
    );

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   GET /api/categories/:type
// @desc    Get categories by type
// @access  Private
router.get('/:type', authMiddleware, async (req, res) => {
  try {
    const { type } = req.params;

    const [categories] = await db.query(
      'SELECT * FROM categories WHERE type = ? ORDER BY name',
      [type]
    );

    res.json(categories);
  } catch (error) {
    console.error('Get categories by type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   POST /api/categories
// @desc    Create a new category (Admin only)
// @access  Private/Admin
router.post('/', [
  authMiddleware,
  roleMiddleware(['admin']),
  body('name').notEmpty().withMessage('Category name is required'),
  body('type').isIn(['personal', 'for_sale']).withMessage('Type must be personal or for_sale')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, description } = req.body;

    // Check if category exists
    const [existingCategories] = await db.query(
      'SELECT id FROM categories WHERE name = ? AND type = ?',
      [name, type]
    );

    if (existingCategories.length > 0) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    // Insert category
    const [result] = await db.query(
      'INSERT INTO categories (name, type, description) VALUES (?, ?, ?)',
      [name, type, description]
    );

    res.status(201).json({
      message: 'Category created successfully',
      category: {
        id: result.insertId,
        name,
        type,
        description
      }
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category (Admin only)
// @access  Private/Admin
router.put('/:id', [
  authMiddleware,
  roleMiddleware(['admin']),
  body('name').optional().notEmpty().withMessage('Category name cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const categoryId = req.params.id;
    const { name, description } = req.body;

    // Check if category exists
    const [categories] = await db.query(
      'SELECT id FROM categories WHERE id = ?',
      [categoryId]
    );

    if (categories.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Build update fields
    const updateFields = {};
    const updateValues = [];

    if (name) {
      updateFields.name = name;
      updateValues.push(name);
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

    const sql = `UPDATE categories SET ${setClause} WHERE id = ?`;
    updateValues.push(categoryId);

    await db.query(sql, updateValues);

    res.json({ message: 'Category updated successfully' });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category (Admin only)
// @access  Private/Admin
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Check if category exists
    const [categories] = await db.query(
      'SELECT id FROM categories WHERE id = ?',
      [categoryId]
    );

    if (categories.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category has profiles
    const [profiles] = await db.query(
      'SELECT id FROM profiles WHERE category_id = ? LIMIT 1',
      [categoryId]
    );

    if (profiles.length > 0) {
      return res.status(400).json({ error: 'Cannot delete category with existing profiles' });
    }

    // Delete category
    await db.query('DELETE FROM categories WHERE id = ?', [categoryId]);

    res.json({ message: 'Category deleted successfully' });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
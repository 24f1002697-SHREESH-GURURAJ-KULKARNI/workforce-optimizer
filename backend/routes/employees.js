// This router handles all employee CRUD actions.
// It keeps the API focused on Employee operations and returns clear 400/404 errors.

const express = require('express');
const mongoose = require('mongoose');

const Employee = require('../models/Employee');

const router = express.Router();

// Helper for shared validation errors.
function handleValidationError(res, err) {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  return res.status(400).json({ message: 'Invalid employee data' });
}

// POST /api/employees
router.post('/', async (req, res) => {
  try {
    const employee = new Employee(req.body);
    const savedEmployee = await employee.save();
    res.status(201).json(savedEmployee);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    return handleValidationError(res, err);
  }
});

// GET /api/employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ name: 1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/employees/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid employee ID' });
  }

  try {
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/employees/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid employee ID' });
  }

  try {
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    Object.assign(employee, req.body);
    const updatedEmployee = await employee.save();
    res.json(updatedEmployee);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    return handleValidationError(res, err);
  }
});

// DELETE /api/employees/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid employee ID' });
  }

  try {
    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

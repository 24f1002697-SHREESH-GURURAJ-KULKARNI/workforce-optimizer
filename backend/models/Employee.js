// This file defines the Employee data structure for MongoDB.
// It stores what a manager adds: basic profile info, skills, and weekly availability.

const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    skillName: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (value) {
          return value && value.trim().length > 0;
        },
        message: 'Skill name is required',
      },
    },
    level: {
      type: Number,
      required: true,
      min: [1, 'Skill level must be between 1 and 5'],
      max: [5, 'Skill level must be between 1 and 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Skill level must be an integer',
      },
    },
  },
  { _id: false }
);

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (value) {
          return value && value.trim().length > 0;
        },
        message: 'Name is required',
      },
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      validate: {
        validator: function (value) {
          return /.+@.+\..+/.test(value);
        },
        message: 'Email must be a valid email address',
      },
    },
    skills: {
      type: [skillSchema],
      default: [],
      validate: {
        validator: function (value) {
          const seen = new Set();

          for (const skill of value) {
            const normalizedName = (skill.skillName || '').trim().toLowerCase();
            if (!normalizedName) {
              return false;
            }
            if (seen.has(normalizedName)) {
              return false;
            }
            seen.add(normalizedName);
          }

          return true;
        },
        message: 'Duplicate skill names are not allowed',
      },
    },
    weeklyAvailabilityHours: {
      type: Number,
      required: true,
      min: [0, 'Weekly availability must be between 0 and 40'],
      max: [40, 'Weekly availability must be between 0 and 40'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);

// This file defines the Project data structure for MongoDB.
// Projects include a short description and the skills needed for the work.

const mongoose = require('mongoose');

const requiredSkillSchema = new mongoose.Schema(
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
    minLevel: {
      type: Number,
      required: true,
      min: [1, 'Minimum skill level must be between 1 and 5'],
      max: [5, 'Minimum skill level must be between 1 and 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Minimum skill level must be an integer',
      },
    },
    weight: {
      type: Number,
      default: 0,
      min: [0, 'Skill weight must be between 0 and 1'],
      max: [1, 'Skill weight must be between 0 and 1'],
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (value) {
          return value && value.trim().length > 0;
        },
        message: 'Project name is required',
      },
    },
    description: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (value) {
          return value && value.trim().length > 0;
        },
        message: 'Project description is required',
      },
    },
    requiredSkills: {
      type: [requiredSkillSchema],
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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);

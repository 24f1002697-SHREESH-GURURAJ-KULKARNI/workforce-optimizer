// This file defines saved employee-to-project match results.
const mongoose = require('mongoose');

const breakdownItemSchema = new mongoose.Schema(
  {
    skillName: {
      type: String,
      required: true,
    },
    match: {
      type: Number,
      min: 0,
      max: 1,
    },
    weight: {
      type: Number,
      min: 0,
      max: 1,
    },
  },
  { _id: false }
);

const allocationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    verdict: {
      type: String,
      required: true,
      enum: ['Low', 'Moderate', 'High'],
    },
    breakdown: {
      type: [breakdownItemSchema],
      default: [],
    },
    explanation: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (value) {
          return value.length > 0;
        },
        message: 'Explanation is required',
      },
    },
    status: {
      type: String,
      enum: ['proposed', 'approved', 'rejected'],
      default: 'proposed',
    },
  },
  { timestamps: true }
);

allocationSchema.index({ project: 1, employee: 1 }, { unique: true });

module.exports = mongoose.model('Allocation', allocationSchema);

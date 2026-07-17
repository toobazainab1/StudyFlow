const mongoose = require('mongoose');

/**
 * Task Schema — the database-level "shield" (Pillar 4).
 *
 * Validation happens in two layers on purpose:
 *   1. middleware/validateTask.js checks the request BEFORE it reaches here.
 *   2. This schema enforces the same rules again at the database level.
 * That second layer matters because the database should never blindly
 * trust application code — if some other part of the app (or a future
 * script) tries to save bad data directly, the schema still blocks it.
 */
const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Task name is required.'],
      trim: true,
      minlength: [1, 'Task name cannot be empty.']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    priority: {
      type: String,
      enum: {
        values: ['high', 'medium', 'low'],
        message: 'Priority must be one of: high, medium, low.'
      },
      default: 'medium'
    },
    category: {
      type: String,
      trim: true,
      default: ''
    },
    dueDate: {
      type: Date,
      default: null
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true // adds createdAt and updatedAt automatically
  }
);

// Reshape the JSON response: expose "id" instead of Mongo's "_id",
// and drop internal fields the frontend never needs to see.
taskSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('Task', taskSchema);
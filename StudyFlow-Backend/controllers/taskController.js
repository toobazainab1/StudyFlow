const Task = require('../models/task');

/**
 * Looks up a task by ID safely. If the ID isn't a validly-formatted
 * MongoDB ObjectId, Mongoose throws a CastError — we treat that the same
 * as "not found" (404) instead of letting it become a confusing 500.
 */
async function safeFindById(id) {
  try {
    return await Task.findById(id);
  } catch (err) {
    if (err.name === 'CastError') return null;
    throw err;
  }
}

/**
 * Converts a Mongoose validation/cast error into a clean 400 response.
 * Returns true if it handled the error (caller should stop), false if
 * the caller should let the error continue to the global error handler.
 */
function respondIfMongooseError(err, res) {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({ success: false, message: 'Validation failed.', errors });
    return true;
  }
  if (err.name === 'CastError') {
    res.status(400).json({ success: false, message: `Invalid value for "${err.path}".` });
    return true;
  }
  return false;
}

/**
 * GET /api/tasks
 * Returns all tasks, newest first. Supports optional ?completed=true/false
 * and ?priority=high/medium/low query filters.
 */
async function getAllTasks(req, res) {
  const filter = {};
  const { completed, priority } = req.query;

  if (completed !== undefined) filter.completed = completed === 'true';
  if (priority) filter.priority = priority;

  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: tasks.length, data: tasks });
}

/**
 * GET /api/tasks/:id
 */
async function getTaskById(req, res) {
  const task = await safeFindById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: `No task found with id "${req.params.id}".`
    });
  }

  res.status(200).json({ success: true, data: task });
}

/**
 * POST /api/tasks
 * middleware/validateTask.js already checked the request body, but the
 * schema validates again here as a second layer of defense.
 */
async function createTask(req, res) {
  try {
    const newTask = await Task.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: newTask
    });
  } catch (err) {
    if (respondIfMongooseError(err, res)) return;
    throw err;
  }
}

/**
 * PUT /api/tasks/:id
 */
async function updateTask(req, res) {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return the document AFTER the update, not before
      runValidators: true // re-run schema validation on the update
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `No task found with id "${req.params.id}".`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: updated
    });
  } catch (err) {
    if (respondIfMongooseError(err, res)) return;
    throw err;
  }
}

/**
 * DELETE /api/tasks/:id
 */
async function deleteTask(req, res) {
  const deleted = await safeFindById(req.params.id).then((task) =>
    task ? Task.findByIdAndDelete(req.params.id) : null
  );

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: `No task found with id "${req.params.id}".`
    });
  }

  res.status(204).send();
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
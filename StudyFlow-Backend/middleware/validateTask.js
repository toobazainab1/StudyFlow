/**
 * Validation middleware — "Never Trust the Client."
 *
 * This runs BEFORE the actual create/update logic. If the incoming data
 * is invalid, we stop here and send back a 400 Bad Request, so bad data
 * never even reaches our task list.
 *
 * Two variants:
 *  - validateNewTask: used on POST — "name" is required (a task must have one).
 *  - validateTaskUpdate: used on PUT — fields are optional (e.g. you might
 *    only be sending { completed: true } to toggle a task), but whatever
 *    IS sent still has to be valid.
 */

const ALLOWED_PRIORITIES = ['high', 'medium', 'low'];

function collectCommonErrors(body) {
  const errors = [];

  if (body.priority !== undefined && !ALLOWED_PRIORITIES.includes(body.priority)) {
    errors.push(`"priority" must be one of: ${ALLOWED_PRIORITIES.join(', ')}.`);
  }

  if (body.description !== undefined && typeof body.description !== 'string') {
    errors.push('"description" must be a string.');
  }

  if (body.category !== undefined && typeof body.category !== 'string') {
    errors.push('"category" must be a string.');
  }

  if (body.completed !== undefined && typeof body.completed !== 'boolean') {
    errors.push('"completed" must be true or false.');
  }

  return errors;
}

function validateNewTask(req, res, next) {
  const { name } = req.body;
  const errors = collectCommonErrors(req.body);

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Task "name" is required and must be a non-empty string.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed.', errors });
  }

  next();
}

function validateTaskUpdate(req, res, next) {
  const { name } = req.body;
  const errors = collectCommonErrors(req.body);

  // On update, name is optional — but if it IS provided, it can't be empty
  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    errors.push('"name" cannot be empty if provided.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed.', errors });
  }

  next();
}

module.exports = { validateNewTask, validateTaskUpdate };
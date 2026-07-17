const express = require('express');
const router = express.Router();

const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

const validateTask = require('../middleware/validateTask');

// RESTful naming: the URL is a NOUN (/tasks), the HTTP method is the VERB.
// Never write GET /getTasks or POST /createTask — the method already says that.

router.get('/', getAllTasks);          // GET    /api/tasks
router.get('/:id', getTaskById);       // GET    /api/tasks/:id
router.post('/', validateTask.validateNewTask, createTask);      // POST   /api/tasks
router.put('/:id', validateTask.validateTaskUpdate, updateTask); // PUT    /api/tasks/:id
router.delete('/:id', deleteTask);     // DELETE /api/tasks/:id

module.exports = router;
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------- Middleware ---------- */
app.use(cors());          // allows your frontend (different origin) to call this API
app.use(express.json());  // parses incoming JSON request bodies into req.body

/* ---------- Health Check ---------- */
// A simple root route so you can quickly confirm the server is alive.
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskFlow API is running.',
    endpoints: {
      getAllTasks: 'GET /api/tasks',
      getOneTask: 'GET /api/tasks/:id',
      createTask: 'POST /api/tasks',
      updateTask: 'PUT /api/tasks/:id',
      deleteTask: 'DELETE /api/tasks/:id'
    }
  });
});

/* ---------- Routes ---------- */
app.use('/api/tasks', taskRoutes);

/* ---------- 404 Handler ---------- */
// Runs if a request doesn't match any route above.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} does not exist.`
  });
});

/* ---------- Global Error Handler ---------- */
// Catches any unexpected errors thrown in route handlers (including
// rejected promises from async controllers — Express 5 forwards these
// here automatically) so the server never crashes silently.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server.'
  });
});

/* ---------- Start ---------- */
// Connect to the database FIRST, then start listening. If the database
// connection fails, connectDB() exits the process — there's no point
// running an API with nothing to store data in.
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`TaskFlow API running at http://localhost:${PORT}`);
  });
}

start();
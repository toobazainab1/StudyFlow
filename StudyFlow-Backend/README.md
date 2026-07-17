# TaskFlow API

A RESTful backend API for the TaskFlow task management dashboard, built with **Node.js + Express + MongoDB (Mongoose)**.

This is Project 3 of the Decode Labs Full Stack Development internship — the database integration milestone, building on the Project 2 API by replacing in-memory storage with a real, persistent MongoDB database.

---

## Tech Stack

- **Node.js** — JavaScript runtime
- **Express 5** — web framework for building the API
- **MongoDB** — NoSQL document database (via MongoDB Atlas, free tier)
- **Mongoose** — ODM that maps JavaScript objects to MongoDB documents and enforces schema validation
- **dotenv** — loads environment variables (like the database connection string) from a `.env` file
- **CORS** — allows the frontend (running on a different port/origin) to call this API

---

## What Changed From Project 2

Project 2 stored tasks in a plain JavaScript array that reset every time the server restarted. Project 3 replaces that with a real database, so data now persists permanently:

| | Project 2 | Project 3 |
|---|---|---|
| Storage | In-memory array | MongoDB (Atlas) |
| Data survives restart? | No | Yes |
| Task IDs | Simple incrementing numbers | MongoDB ObjectIds |
| Validation | Middleware only | Middleware **and** database schema (defense in depth) |

---

## Project Structure

```
TaskFlow-Backend/
├── server.js                  # Entry point — loads env vars, connects to DB, starts the server
├── package.json
├── .env.example                # Template for your own .env file (never commit real credentials)
├── config/
│   └── db.js                   # MongoDB connection logic
├── models/
│   └── Task.js                 # Mongoose schema — defines what a Task looks like in the database
├── routes/
│   └── taskRoutes.js           # Defines URL paths + which controller function handles each
├── controllers/
│   └── taskController.js       # The actual logic for each endpoint (now using Mongoose queries)
└── middleware/
    └── validateTask.js         # Checks incoming request data before it reaches the controller
```

---

## Setup: MongoDB Atlas (one-time)

You need a free MongoDB Atlas account and cluster before this will run.

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Create a new **free (M0) cluster**
3. Under **Database Access**, create a database user with a username and password (save these — you'll need them)
4. Under **Network Access**, add your current IP address (or `0.0.0.0/0` to allow access from anywhere, fine for development)
5. Go to **Database → Connect → Drivers**, copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your actual database user credentials, and add a database name before the `?` (e.g. `/taskflow?`)

---

## How to Run It

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file from the template
cp .env.example .env

# 3. Open .env and paste your real MongoDB Atlas connection string into MONGO_URI

# 4. Start the server
npm start
```

If everything is set up correctly, you'll see:
```
MongoDB connected successfully.
TaskFlow API running at http://localhost:5000
```

If `MONGO_URI` is missing or wrong, the server will print a clear error message and exit — it won't run without a working database connection.

---

## API Endpoints

Identical to Project 2 — the routes didn't change, only what's behind them did.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks (newest first) |
| GET | `/api/tasks?completed=true` | Get only completed tasks |
| GET | `/api/tasks?priority=high` | Get only high priority tasks |
| GET | `/api/tasks/:id` | Get a single task by ID |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update an existing task |
| DELETE | `/api/tasks/:id` | Delete a task |

### Example: Create a task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"name":"Design homepage","priority":"high","category":"UI Design","dueDate":"2026-07-10"}'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created successfully.",
  "data": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Design homepage",
    "description": "",
    "priority": "high",
    "category": "UI Design",
    "dueDate": "2026-07-10T00:00:00.000Z",
    "completed": false,
    "createdAt": "2026-07-15T12:00:00.000Z",
    "updatedAt": "2026-07-15T12:00:00.000Z"
  }
}
```

Note the `id` is now a MongoDB ObjectId string instead of a simple number, and `createdAt`/`updatedAt` are added automatically by Mongoose's `timestamps` option.

---

## The Task Schema

Defined in `models/Task.js`:

| Field | Type | Rules |
|-------|------|-------|
| `name` | String | Required, cannot be empty |
| `description` | String | Optional |
| `priority` | String | Must be `high`, `medium`, or `low` (defaults to `medium`) |
| `category` | String | Optional |
| `dueDate` | Date | Optional |
| `completed` | Boolean | Defaults to `false` |
| `createdAt` / `updatedAt` | Date | Added automatically by Mongoose |

---

## Two Layers of Validation

1. **`middleware/validateTask.js`** checks the request body before it reaches the controller (fast rejection, clear error messages).
2. **`models/Task.js`** (the Mongoose schema) validates again at the database level.

This matters because the database should never blindly trust application code — if anything else ever writes to this collection directly, the schema still enforces the rules.

---

## Status Codes Used

| Code | Meaning | When it happens |
|------|---------|------------------|
| 200 | OK | Successful GET or PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation failed (middleware or schema) |
| 404 | Not Found | Task ID doesn't exist, or unknown route |
| 500 | Internal Server Error | Unexpected server-side error |

---

## Security Notes

- **No SQL/NoSQL injection risk from user input:** Mongoose builds queries safely under the hood rather than concatenating raw strings, so user input is always treated as data, never as executable query logic.
- **`.env` is never committed** — it's listed in `.gitignore`. Only `.env.example` (with placeholder values) is committed, so real database credentials never end up in version control.

---

## Notes

- This API is designed to eventually connect to the TaskFlow frontend from Project 1, replacing its `localStorage`-based persistence with real server-side storage.
- Mongoose's `runValidators: true` option is used on updates so partial updates (e.g., just `{ "completed": true }`) still get validated against the schema.
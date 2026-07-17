# StudyFlow

A modern full-stack student productivity application that helps students organize assignments, track academic progress, manage exams, and stay focused—all in one place.

StudyFlow is built with a clean separation between frontend and backend, making it scalable and easy to maintain.

---

# Features

## Frontend

- Responsive dashboard for mobile, tablet, and desktop
- Assignment management
  - Add assignments
  - Edit assignments
  - Delete assignments
  - Mark as completed
  - Search and filter
- Course progress tracking
- Upcoming exams with live countdown
- Interactive monthly calendar
- Pomodoro focus timer
- Quick notes
- Dark mode
- Study streak tracking
- Data stored using Local Storage
- Keyboard shortcuts
- Accessible and semantic UI
- Print-friendly dashboard

---

## Backend

- RESTful API built with Express.js
- MongoDB database using Mongoose
- Full CRUD operations
- Request validation middleware
- Environment variable support with dotenv
- CORS enabled
- Persistent database storage
- Structured MVC architecture

---

# Tech Stack

## Frontend

- HTML5
- CSS3
- Vanilla JavaScript

## Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- dotenv
- CORS

---

# Project Structure

```text
StudyFlow/
│
├── README.md
├── LICENSE
├── .gitignore
│
├── StudyFlow-Frontend/
│   ├── index.html
│   ├── settings.html
│   ├── css/
│   ├── js/
│   └── assets/
│
└── StudyFlow-Backend/
    ├── server.js
    ├── package.json
    ├── package-lock.json
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    └── .env.example
```

---

# Frontend Features

- Responsive dashboard
- Assignment manager
- Course progress
- Exam countdown
- Calendar popup
- Pomodoro timer
- Notes
- Dark mode
- Study streak
- Local Storage
- Keyboard shortcuts
- Accessibility support

---

# Backend Features

- Create Task
- Read Tasks
- Update Task
- Delete Task
- MongoDB database
- Request validation
- Error handling
- REST API architecture

---

# Getting Started

## Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/StudyFlow.git
```

---

## Frontend

Open:

```
StudyFlow-Frontend/index.html
```

or use Live Server in VS Code.

---

## Backend

Navigate to the backend folder.

```bash
cd StudyFlow-Backend
```

Install dependencies.

```bash
npm install
```

Create a `.env` file.

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Start the server.

```bash
npm start
```

The API will be available at

```
http://localhost:5000
```

---

# API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/:id` | Get a single task |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

---

# Future Improvements

- User authentication
- Cloud deployment
- Email reminders
- Push notifications
- Drag-and-drop task management
- Real-time collaboration
- Analytics dashboard


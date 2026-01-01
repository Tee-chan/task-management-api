# TaskRunner API

A robust RESTful API for task management with user authentication, built with Node.js, Express, and MongoDB.
[View the live application on Render](https://task-runner-b4ye.onrender.com)

## Features

### Core Task Management
- Full task CRUD: Task Creation, Task Retrieval, Task Updates, Task Deletion 
- Add title, status, due dates and descriptions/notes
- User authentication (register, login)
- Task ownership enforcement
- Pagination
- Filtering (status, priority, search)
- Sorting
- Trash management: Soft delete with restore, Permanent delete


### User Authentication & Authorization
- User registration with encrypted passwords
- JWT-based authentication
- User-specific task isolation (users only see their own tasks)


## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
---

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/devTenshi/task-api.git
   cd task-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbName>
   JWT_SECRET=your_secret_token
   NODE_ENV=development or production
   ```

4. **Start MongoDB:**
   
   If using local MongoDB:
   ```bash
   mongod
   ```
   
   Or use MongoDB Atlas connection string in your `.env` file.


5. **Start the server:**
   
   Development mode (with nodemon):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

6. **Verify the server is running:**
   ```
   Server running at: http://localhost:5000
   ```

---

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Task Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get all user tasks | Yes |
| GET | `/api/tasks/:id` | Get single task | Yes |
| POST | `/api/tasks` | Create new task | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Yes |
| PATCH | `/api/v1/tasks/:id/restore` | Restore deleted tasks | Yes |
| GET | `/api/v1/tasks/trash` | Get deleted tasks | Yes |
| DELETE | `/api/v1/tasks/:id/permanent` | Permanently delete tasks | Yes |


### Query Parameters for GET `/api/tasks`

- `?priority=high` - Filter by priority (low, medium, high)
- `?completed=true` - Filter by completion status
- `?search=keyword` - Search in title and description
- `?page=1&limit=10` - Pagination
- `?sortBy=dueDate&order=asc` - Sort results

---

## Testing with Postman

### 1. Register a User
```http
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Login
```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response includes JWT token:**
```json
{
  "data":{
  "generateAccessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.."},
  "user": { ... }
}
```

### With Authorization:
### 3. Create a Task 
```http
POST http://localhost:5000/api/v1/tasks
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### 4. Get All Tasks
```http
GET http://localhost:5000/api/v1/tasks
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### 5. Get Task
```http
GET http://localhost:5000/api/v1/tasks/taskId
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### 6. Update a Task
```http
PUT http://localhost:5000/api/v1/tasks/taskId
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### 7. SoftDelete a Task
```http
DELETE http://localhost:5000/api/v1/tasks/taskId
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### 8. Restore a softDeleted Task
```http
PATCH http://localhost:5000/api/v1/tasks/taskId/restore
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### 9. Get all deleted Tasks
```http
GET http://localhost:5000/api/v1/tasks/trash
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### 10. Permanently Delete a Task
```http
DELETE http://localhost:5000/api/v1/tasks/taskId/permanent
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

---

## Project Structure

```
task-api/
├── src/
│   ├── controllers/           # Request handlers
│   │   ├── authController.js  # Auth logic (register, login)
│   │   └── taskController.js  # Task CRUD operations
│   ├── models/                # Database schemas
│   │   ├── User.js            # User model
│   │   └── Task.js            # Task model
│   ├── routes/                # API route definitions
│   │   ├── authRoutes.js      # Auth endpoints
│   │   └── taskRoutes.js      # Task endpoints
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js            # JWT verification
│   ├── config/                # Configuration files
│   │   └── db.js              # MongoDB connection
│   └── server.js              # App entry point
├── .env                       # Environment variables
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies
└── README.md                  # Documentation

```

---

## Security Features

- **Password Hashing** - bcryptjs with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - Prevent brute force attacks
- **CORS** - Controlled cross-origin requests

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbName>` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key_here for token encryption` |
| `NODE_ENV` | Environment mode | `development` or `production` |

---

## Future Enhancements

- [ ] Email verification for new users
- [ ] Password reset functionality
- [ ] Task reminders and notifications
- [ ] Export tasks (CSV, PDF)
- [ ] Prioritiy weights for tasks
- [ ] Catergories and sub-tasks for better organization and user experience
- [ ] Mobile app integration
- [ ] WebSocket for real-time updates

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Author

**Tee-chan**
- GitHub: [@Tee-chan](https://github.com/Tee-chan)

---


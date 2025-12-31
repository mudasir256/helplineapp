# Helpline App Backend

A professional Node.js backend application built with Express.js and MongoDB.

## Features

- RESTful API architecture
- User management (CRUD operations)
- Password hashing with bcrypt
- Input validation with express-validator
- Error handling middleware
- MongoDB integration with Mongoose
- CORS enabled
- Request logging with Morgan

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **dotenv** - Environment variables

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/helplineapp
```

4. Make sure MongoDB is running on your system

5. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Users

- `GET /api/users` - Get all users (with pagination and search)
  - Query params: `page`, `limit`, `search`
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/password` - Update user password
- `DELETE /api/users/:id` - Delete user

### Health Check

- `GET /api/health` - Server health check

## Example Requests

### Create User
```bash
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "role": "user"
}
```

### Update User
```bash
PUT /api/users/:id
Content-Type: application/json

{
  "name": "Jane Doe",
  "phone": "9876543210"
}
```

### Get All Users with Pagination
```bash
GET /api/users?page=1&limit=10&search=john
```

## Project Structure

```
helplineappbackend/
├── config/
│   └── database.js       # MongoDB connection
├── controllers/
│   └── userController.js # User business logic
├── middleware/
│   └── errorHandler.js   # Error handling
├── models/
│   └── User.js           # User schema
├── routes/
│   └── userRoutes.js     # User routes
├── .env.example          # Environment variables template
├── .gitignore
├── package.json
├── README.md
└── server.js             # Application entry point
```

## License

ISC



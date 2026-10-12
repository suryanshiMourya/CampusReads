
# CampusReads — Book Review App

CampusReads is a student-focused book discovery and review
platform built using the MERN stack.

## Features

1 User registration and login with JWT authentication
2 Browse, search and filter books
3 Add, edit and delete your own books
4  View book details and reviews
5 Submit one review per user per book
6 Edit and delete your own reviews
7 My Reviews page
8 MongoDB database integration
9  Responsive user interface

## Tech Stack

- Frontend: React, Vite, CSS, Axios
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Authentication: JSON Web Tokens, bcryptjs

## Project Structure

CampusReads/
├── client/
└── server/

## Run Locally

### 1. Backend

Open a terminal:

cd server
npm install
node server.js

### 2. Frontend

Open another terminal:

cd client
npm install
npm run dev

## Environment Variables

Create a `.env` file inside the server folder with:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
PORT=5000

Never commit your `.env` file or credentials to GitHub.

## API Routes

1 POST /api/auth/register
2 POST /api/auth/login
3  GET /api/books
4  POST /api/books
5  GET /api/books/:id
6 PUT /api/books/:id
7 DELETE /api/books/:id
8 GET /api/reviews/my-reviews
9 GET /api/reviews/:bookId
10 POST /api/reviews/:bookId
11 PUT /api/reviews/review/:reviewId
12  DELETE /api/reviews/review/:reviewId

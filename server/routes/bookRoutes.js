
import express from "express";

import {
  addBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook
} from "../controllers/bookController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all books
// GET /api/books
router.get("/", getBooks);

// Add a new book (login required)
// POST /api/books
router.post("/", protect, addBook);

// Update a book (only the owner)
// PUT /api/books/:id
router.put("/:id", protect, updateBook);

// Delete a book (only the owner)
// DELETE /api/books/:id
router.delete("/:id", protect, deleteBook);

// Get a single book by ID
// GET /api/books/:id
router.get("/:id", getBookById);

export default router;

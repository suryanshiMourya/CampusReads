
import mongoose from "mongoose";
import Book from "../models/Book.js";
import Review from "../models/Review.js";

// Add a new book
export async function addBook(req, res) {
  try {
    const { title, author, category, coverUrl, description } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof author !== "string" ||
      !author.trim()
    ) {
      return res.status(400).json({
        message: "Title and author are required"
      });
    }

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      category,
      coverUrl,
      description,
      addedBy: req.user.id
    });

    return res.status(201).json({
      message: "Book added successfully",
      book
    });
  } catch (error) {
    console.error("Add book error:", error.message);
    return res.status(500).json({
      message: "Server error while adding book"
    });
  }
}

// Get all books
export async function getBooks(req, res) {
  try {
    const books = await Book.find()
      .populate("addedBy", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: books.length,
      books
    });
  } catch (error) {
    console.error("Get books error:", error.message);
    return res.status(500).json({
      message: "Server error while fetching books"
    });
  }
}

// Get one book by ID
export async function getBookById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid book ID"
      });
    }

    const book = await Book.findById(id)
      .populate("addedBy", "name");

    if (!book) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    return res.status(200).json({ book });
  } catch (error) {
    console.error("Get book error:", error.message);
    return res.status(500).json({
      message: "Server error while fetching book"
    });
  }
}

// Update a book (only its owner)
export async function updateBook(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid book ID"
      });
    }

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    if (book.addedBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only edit books you added"
      });
    }

    const { title, author, category, coverUrl, description } = req.body;

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          message: "Title cannot be empty"
        });
      }
      book.title = title.trim();
    }

    if (author !== undefined) {
      if (typeof author !== "string" || !author.trim()) {
        return res.status(400).json({
          message: "Author cannot be empty"
        });
      }
      book.author = author.trim();
    }

    if (category !== undefined) book.category = category;
    if (coverUrl !== undefined) book.coverUrl = coverUrl;
    if (description !== undefined) book.description = description;

    await book.save();

    return res.status(200).json({
      message: "Book updated successfully",
      book
    });
  } catch (error) {
    console.error("Update book error:", error.message);
    return res.status(500).json({
      message: "Server error while updating book"
    });
  }
}

// Delete a book and its associated reviews (only its owner)
export async function deleteBook(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid book ID"
      });
    }

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    if (book.addedBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only delete books you added"
      });
    }

    await Review.deleteMany({ book: id });
    await book.deleteOne();

    return res.status(200).json({
      message: "Book deleted successfully"
    });
  } catch (error) {
    console.error("Delete book error:", error.message);
    return res.status(500).json({
      message: "Server error while deleting book"
    });
  }
}

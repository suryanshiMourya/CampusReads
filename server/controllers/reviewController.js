import mongoose from "mongoose";
import Review from "../models/Review.js";
import Book from "../models/Book.js";

// Add a review to a book
export async function addReview(req, res) {
  try {
    const { bookId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({
        message: "Invalid book ID"
      });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be a whole number from 1 to 5"
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        message: "Comment is required"
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    const existingReview = await Review.findOne({
      book: bookId,
      user: req.user.id
    });

    if (existingReview) {
      return res.status(409).json({
        message: "You have already reviewed this book"
      });
    }

    const review = await Review.create({
      book: bookId,
      user: req.user.id,
      rating,
      comment: comment.trim()
    });

    return res.status(201).json({
      message: "Review added successfully",
      review
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already reviewed this book"
      });
    }

    console.error("Add review error:", error.message);
    return res.status(500).json({
      message: "Server error while adding review"
    });
  }
}
export async function getBookReviews(req, res) {
  try {
    const { bookId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({
        message: "Invalid book ID"
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    const reviews = await Review.find({ book: bookId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    const averageRating = reviews.length
      ? Number((totalRating / reviews.length).toFixed(1))
      : 0;

    return res.status(200).json({
      count: reviews.length,
      averageRating,
      reviews
    });
  } catch (error) {
    console.error("Get reviews error:", error.message);

    return res.status(500).json({
      message: "Server error while fetching reviews"
    });
  }
}
export async function deleteReview(req, res) {
  try {
    const { reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        message: "Invalid review ID"
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    // Only the review owner can delete it
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only delete your own review"
      });
    }

    await review.deleteOne();

    return res.status(200).json({
      message: "Review deleted successfully"
    });
  } catch (error) {
    console.error("Delete review error:", error.message);

    return res.status(500).json({
      message: "Server error while deleting review"
    });
  }
}
export async function updateReview(req, res) {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        message: "Invalid review ID"
      });
    }

    if (
      rating !== undefined &&
      (!Number.isInteger(rating) || rating < 1 || rating > 5)
    ) {
      return res.status(400).json({
        message: "Rating must be a whole number from 1 to 5"
      });
    }

    if (comment !== undefined && !comment.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty"
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only edit your own review"
      });
    }

    

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment.trim();

    await review.save();

    return res.status(200).json({
      message: "Review updated successfully",
      review
    });
  } catch (error) {
    console.error("Update review error:", error.message);

    return res.status(500).json({
      message: "Server error while updating review"
    });
  }
}

 // Get reviews written by the logged-in user
export async function getMyReviews(req, res) {
  try {
    const reviews = await Review.find({
      user: req.user.id
    })
      .populate("book", "title author category coverUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error("Get my reviews error:", error.message);

    return res.status(500).json({
      message: "Server error while fetching your reviews"
    });
  }
}

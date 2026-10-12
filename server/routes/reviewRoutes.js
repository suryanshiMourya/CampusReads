
import express from "express";

import {
  addReview,
  getBookReviews,
  getMyReviews,
  deleteReview,
  updateReview
} from "../controllers/reviewController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get reviews written by the logged-in user
// IMPORTANT: Keep this route before /:bookId
router.get("/my-reviews", protect, getMyReviews);

// Get all reviews for a particular book
router.get("/:bookId", getBookReviews);

// Add a review to a book
router.post("/:bookId", protect, addReview);

// Update your own review
router.put("/review/:reviewId", protect, updateReview);

// Delete your own review
router.delete("/review/:reviewId", protect, deleteReview);

export default router;


import { useEffect, useState } from "react";
import api from "./api.js";
import "./App.css";

function BookDetails({ bookId, onBack }) {
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadDetails() {
    setLoading(true);
    setError("");

    try {
      const [bookResponse, reviewResponse] = await Promise.all([
        api.get(`/books/${bookId}`),
        api.get(`/reviews/${bookId}`),
      ]);

      const bookData = bookResponse.data;
      setBook(bookData.book || bookData);

      setReviews(reviewResponse.data.reviews || []);
      setAverageRating(
        Number(reviewResponse.data.averageRating || 0)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load book details and reviews."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDetails();
  }, [bookId]);

  async function handleSubmitReview(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.post(`/reviews/${bookId}`, {
        rating: Number(rating),
        comment: comment.trim(),
      });

      setComment("");
      setRating("5");
      setSuccess("Your review was submitted successfully.");

      await loadDetails();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not submit your review. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="book-details-page">
        <p>Loading book details...</p>
      </main>
    );
  }

  if (error && !book) {
    return (
      <main className="book-details-page">
        <p className="dashboard-error">{error}</p>
        <button onClick={onBack}>← Back to books</button>
      </main>
    );
  }

  if (!book) {
    return <p>Book not found.</p>;
  }

  return (
    <main className="book-details-page">
      <button
        type="button"
        className="dashboard-review-button"
        onClick={onBack}
      >
        ← Back to books
      </button>

      <section className="book-details-card">
        {book.coverUrl && (
          <img
            className="book-details-cover"
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
          />
        )}

        <div>
          <span className="dashboard-book-category">
            {book.category || book.genre || "General"}
          </span>

          <h1>{book.title}</h1>
          <p>By {book.author}</p>
          <p>{book.description || "No description available."}</p>

          <h3>
            ⭐ {averageRating.toFixed(1)} / 5
          </h3>

          <p>
            {reviews.length}{" "}
            {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>
      </section>

      <section className="book-review-section">
        <h2>Write a Review</h2>

        <form
          className="dashboard-add-form"
          onSubmit={handleSubmitReview}
        >
          <label htmlFor="review-rating">Your rating</label>

          <select
            id="review-rating"
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            required
          >
            <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
            <option value="4">⭐⭐⭐⭐ - Very good</option>
            <option value="3">⭐⭐⭐ - Good</option>
            <option value="2">⭐⭐ - Fair</option>
            <option value="1">⭐ - Poor</option>
          </select>

          <label htmlFor="review-comment">Your review</label>

          <textarea
            id="review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="What did you think of this book?"
            rows={4}
            required
            maxLength={2000}
          />

          <button
            type="submit"
            className="dashboard-add-button"
            disabled={saving}
          >
            {saving ? "Submitting..." : "Submit Review"}
          </button>
        </form>

        {error && <p className="dashboard-error">{error}</p>}
        {success && (
          <p className="dashboard-success">{success}</p>
        )}
      </section>

      <section className="book-review-section">
        <h2>Reader Reviews</h2>

        {reviews.length === 0 && (
          <p>No reviews yet. Be the first to review this book!</p>
        )}

        {reviews.map((review) => (
          <article className="reader-review" key={review._id}>
            <h3>
              {review.user?.name || "CampusReads Reader"}
            </h3>

            <p>
              {"⭐".repeat(
                Math.min(5, Math.max(0, Number(review.rating) || 0))
              )}
              {" "}
              ({review.rating}/5)
            </p>

            <p>{review.comment}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default BookDetails;


import { useEffect, useState } from "react";
import api from "./api.js";
import "./App.css";

function MyReviews({ onBack }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const fetchMyReviews = async () => {
    try {
      setError("");
      const response = await api.get("/reviews/my-reviews");
      setReviews(response.data.reviews || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const startEditing = (review) => {
    setEditingId(review._id);
    setRating(review.rating);
    setComment(review.comment);
    setError("");
    setSuccess("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setRating(5);
    setComment("");
  };

  const handleUpdate = async (event, reviewId) => {
    event.preventDefault();

    if (!comment.trim()) {
      setError("Please enter a review comment.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Rating must be between 1 and 5.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.put(`/reviews/review/${reviewId}`, {
        rating: Number(rating),
        comment: comment.trim(),
      });

      setSuccess("Review updated successfully!");
      cancelEditing();
      await fetchMyReviews();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not update your review."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reviewId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/reviews/review/${reviewId}`);

      setReviews((previous) =>
        previous.filter((review) => review._id !== reviewId)
      );

      if (editingId === reviewId) {
        cancelEditing();
      }

      setSuccess("Review deleted successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not delete your review."
      );
    }
  };

  return (
    <main className="book-details-page">
      <button
        type="button"
        className="dashboard-review-button"
        onClick={onBack}
      >
        ← Back to Dashboard
      </button>

      <h1>My Reviews</h1>
      <p>Manage the reviews you have written on CampusReads.</p>

      {error && (
        <p className="dashboard-error" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="dashboard-success" role="status">
          {success}
        </p>
      )}

      {loading ? (
        <p>Loading your reviews...</p>
      ) : reviews.length === 0 ? (
        <section className="reader-review">
          <h3>No reviews yet</h3>
          <p>
            Open a book from the dashboard and submit your
            first review.
          </p>
        </section>
      ) : (
        reviews.map((review) => (
          <article className="reader-review" key={review._id}>
            <h3>{review.book?.title || "Book"}</h3>

            <p>
              By {review.book?.author || "Unknown author"}
            </p>

            {editingId === review._id ? (
              <form
                onSubmit={(event) =>
                  handleUpdate(event, review._id)
                }
              >
                <label htmlFor={`rating-${review._id}`}>
                  Rating (1–5)
                </label>

                <select
                  id={`rating-${review._id}`}
                  value={rating}
                  onChange={(event) =>
                    setRating(Number(event.target.value))
                  }
                  required
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} {value === 1 ? "star" : "stars"}
                    </option>
                  ))}
                </select>

                <label htmlFor={`comment-${review._id}`}>
                  Your comment
                </label>

                <textarea
                  id={`comment-${review._id}`}
                  value={comment}
                  onChange={(event) =>
                    setComment(event.target.value)
                  }
                  rows={4}
                  required
                />

                <div className="dashboard-book-actions">
                  <button
                    type="submit"
                    className="dashboard-review-button"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    className="dashboard-delete-button"
                    onClick={cancelEditing}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p>
                  Rating: {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </p>

                <p>{review.comment}</p>

                <div className="dashboard-book-actions">
                  <button
                    type="button"
                    className="dashboard-review-button"
                    onClick={() => startEditing(review)}
                  >
                    Edit Review
                  </button>

                  <button
                    type="button"
                    className="dashboard-delete-button"
                    onClick={() => handleDelete(review._id)}
                  >
                    Delete Review
                  </button>
                </div>
              </>
            )}
          </article>
        ))
      )}
    </main>
  );
}

export default MyReviews;

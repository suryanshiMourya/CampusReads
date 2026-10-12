import MyReviews from "./MyReviews.jsx";
import { useEffect, useState } from "react";
import api from "./api.js";
import BookDetails from "./BookDetails.jsx";
import "./App.css";

function Dashboard({ onLogout }) {
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
const [showMyReviews, setShowMyReviews] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    coverUrl: "",
    description: "",
  });

  const storedUser =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  let currentUser = {};

  try {
    currentUser = storedUser ? JSON.parse(storedUser) : {};
  } catch {
    currentUser = {};
  }

  const currentUserId = String(
    currentUser._id || currentUser.id || ""
  );

  const username =
    currentUser.name ||
    currentUser.username ||
    currentUser.email?.split("@")[0] ||
    "Reader";

  // Load books from the backend
  const fetchBooks = async () => {
    try {
      setError("");

      const response = await api.get("/books");

      const data = response.data;

      setBooks(
        Array.isArray(data)
          ? data
          : data.books || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load books. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Open the selected book's details and reviews
 if (showMyReviews) {
  return (
    <MyReviews
      onBack={() => setShowMyReviews(false)}
    />
  );
}

if (selectedBookId) {
  return (
    <BookDetails
      bookId={selectedBookId}
      onBack={() => setSelectedBookId(null)}
    />
  );
}

  // Handle changes in the Add Book form
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Add a new book
  const handleAddBook = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await api.post("/books", {
        title: formData.title.trim(),
        author: formData.author.trim(),
        category: formData.category.trim(),
        coverUrl: formData.coverUrl.trim(),
        description: formData.description.trim(),
      });

      setFormData({
        title: "",
        author: "",
        category: "",
        coverUrl: "",
        description: "",
      });

      setShowAddForm(false);
      setSuccess("Book added successfully!");

      await fetchBooks();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not add the book. Please check your login."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Check whether the current user added this book
  const isMyBook = (book) => {
    const addedBy =
      book.addedBy?._id ||
      book.addedBy?.id ||
      book.addedBy;

    return (
      addedBy &&
      currentUserId &&
      String(addedBy) === currentUserId
    );
  };

  // Edit a book added by the current user
  const handleEditBook = async (book) => {
    const title = window.prompt("Enter book title:", book.title);
    if (title === null) return;

    const author = window.prompt(
      "Enter author name:",
      book.author
    );
    if (author === null) return;

    const category = window.prompt(
      "Enter category:",
      book.category || ""
    );
    if (category === null) return;

    const description = window.prompt(
      "Enter book description:",
      book.description || ""
    );
    if (description === null) return;

    const coverUrl = window.prompt(
      "Enter cover image URL:",
      book.coverUrl || ""
    );
    if (coverUrl === null) return;

    try {
      setError("");
      setSuccess("");

      await api.put(`/books/${book._id}`, {
        title: title.trim(),
        author: author.trim(),
        category: category.trim(),
        description: description.trim(),
        coverUrl: coverUrl.trim(),
      });

      setSuccess("Book updated successfully!");
      await fetchBooks();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not update this book."
      );
    }
  };

  // Delete a book added by the current user
  const handleDeleteBook = async (book) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"? Its reviews may also be deleted.`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/books/${book._id}`);

      setBooks((previous) =>
        previous.filter((item) => item._id !== book._id)
      );

      setSuccess("Book deleted successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not delete this book."
      );
    }
  };

  // Get categories for the filter
  const categories = [
    "All",
    ...new Set(
      books
        .map((book) => book.category)
        .filter(Boolean)
    ),
  ];

  // Apply search and category filters
  const filteredBooks = books.filter((book) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      (book.title || "").toLowerCase().includes(searchText) ||
      (book.author || "").toLowerCase().includes(searchText) ||
      (book.category || "").toLowerCase().includes(searchText);

    const matchesCategory =
      selectedCategory === "All" ||
      book.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <span role="img" aria-label="books">
            📚
          </span>{" "}
          CampusReads
        </div>

        <div className="dashboard-header-actions">
          <span>
            Welcome, <strong>{username}</strong>
          </span>

          <button
            type="button"
            className="dashboard-review-button"
            onClick={() => setShowMyReviews(true)}
          >
            My Reviews
          </button>

          <button
            type="button"
            className="dashboard-review-button"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-hero">
          <p className="dashboard-eyebrow">
            YOUR STUDENT READING COMMUNITY
          </p>

          <h1>Discover your next favorite book.</h1>

          <p>
            Explore books, share your thoughts, and find
            recommendations from fellow readers.
          </p>

          <button
            type="button"
            className="dashboard-add-button"
            onClick={() => {
              setShowAddForm((previous) => !previous);
              setError("");
              setSuccess("");
            }}
          >
            {showAddForm ? "Cancel" : "+ Add a Book"}
          </button>
        </section>

        {error && (
          <div className="dashboard-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="dashboard-success" role="status">
            {success}
          </div>
        )}

        {showAddForm && (
          <section className="dashboard-form-section">
            <h2>Add a New Book</h2>

            <form
              className="dashboard-add-form"
              onSubmit={handleAddBook}
            >
              <label htmlFor="book-title">Book Title *</label>
              <input
                id="book-title"
                name="title"
                type="text"
                placeholder="e.g. Atomic Habits"
                value={formData.title}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="book-author">Author *</label>
              <input
                id="book-author"
                name="author"
                type="text"
                placeholder="e.g. James Clear"
                value={formData.author}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="book-category">Category *</label>
              <input
                id="book-category"
                name="category"
                type="text"
                placeholder="e.g. Self-help"
                value={formData.category}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="book-cover">Cover Image URL</label>
              <input
                id="book-cover"
                name="coverUrl"
                type="url"
                placeholder="https://example.com/book-cover.jpg"
                value={formData.coverUrl}
                onChange={handleInputChange}
              />

              <label htmlFor="book-description">Description</label>
              <textarea
                id="book-description"
                name="description"
                placeholder="Write a short description of the book..."
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />

              <button
                type="submit"
                className="dashboard-add-button"
                disabled={submitting}
              >
                {submitting ? "Adding Book..." : "Save Book"}
              </button>
            </form>
          </section>
        )}

        <section className="dashboard-library">
          <div className="dashboard-section-heading">
            <div>
              <h2>Explore the Library</h2>
              <p>Find books shared by your reading community.</p>
            </div>

            <span>{filteredBooks.length} books</span>
          </div>

          <div className="dashboard-filters">
            <input
              type="search"
              placeholder="Search by title, author, or category..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search books"
            />

            <select
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value)
              }
              aria-label="Filter by category"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "All"
                    ? "All Categories"
                    : category}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="dashboard-empty">
              <p>Loading your books...</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="dashboard-empty">
              <h3>No books found</h3>
              <p>
                {books.length === 0
                  ? "Your library is empty. Add the first book!"
                  : "Try another search or category."}
              </p>
            </div>
          ) : (
            <div className="dashboard-books">
              {filteredBooks.map((book) => (
                <article
                  className="dashboard-book"
                  key={book._id}
                >
                  <div className="dashboard-book-cover">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={`Cover of ${book.title}`}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="dashboard-book-placeholder">
                        <span role="img" aria-label="book">
                          📖
                        </span>
                        <p>{book.title}</p>
                      </div>
                    )}
                  </div>

                  <div className="dashboard-book-info">
                    <span className="dashboard-book-category">
                      {book.category || "General"}
                    </span>

                    <h3>{book.title}</h3>
                    <p className="dashboard-book-author">
                      by {book.author}
                    </p>

                    {book.description && (
                      <p className="dashboard-book-description">
                        {book.description.length > 110
                          ? `${book.description.slice(0, 110)}...`
                          : book.description}
                      </p>
                    )}

                    <div className="dashboard-book-actions">
                      <button
                        type="button"
                        className="dashboard-review-button"
                        onClick={() =>
                          setSelectedBookId(book._id)
                        }
                      >
                        View Reviews
                      </button>

                      {isMyBook(book) && (
                        <>
                          <button
                            type="button"
                            className="dashboard-review-button"
                            onClick={() => handleEditBook(book)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="dashboard-delete-button"
                            onClick={() => handleDeleteBook(book)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;

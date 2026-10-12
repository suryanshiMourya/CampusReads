
import { useState } from "react";
import api from "./api.js";
import Dashboard from "./Dashboard.jsx";
import "./App.css";

const books = [
  {
    title: "Atomic Habits",
    author: "James Clear",
    color: "#d7e8c5",
    cover: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    color: "#e9bd72",
    cover: "https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg",
  },
  {
    title: "Ikigai",
    author: "Héctor García",
    color: "#c8d6e5",
    cover: "https://covers.openlibrary.org/b/isbn/9780143130727-L.jpg",
  },
  {
    title: "Deep Work",
    author: "Cal Newport",
    color: "#a9c6dd",
    cover: "https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg",
  },
];

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const [loggedIn, setLoggedIn] = useState(
    Boolean(
      localStorage.getItem("token") ||
        sessionStorage.getItem("token")
    )
  );

  function handleLogout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");

    // Remove old storage keys from earlier versions.
    localStorage.removeItem("campusreadsToken");
    sessionStorage.removeItem("campusreadsToken");
    localStorage.removeItem("campusreadsUser");
    sessionStorage.removeItem("campusreadsUser");

    setLoggedIn(false);
    setEmail("");
    setPassword("");
    setError("");
    setSuccess("");
  }

  async function handleLogin(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const { token, user } = response.data;

      if (!token) {
        throw new Error("The server did not return a login token.");
      }

      // Clear previous sessions to avoid conflicting tokens.
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");

      // Remember me determines where the token is stored.
      const storage = remember ? localStorage : sessionStorage;

      storage.setItem("token", token);

      if (user) {
        storage.setItem("user", JSON.stringify(user));
      }

      setPassword("");
      setLoggedIn(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  }

  // Display the dashboard after a successful login.
  if (loggedIn) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <main className="rainy-library">
      {/* Rainy background */}
      <div className="rain-window" aria-hidden="true">
        {Array.from({ length: 65 }, (_, index) => (
          <span
            className="raindrop"
            key={index}
            style={{
              left: `${(index * 37) % 100}%`,
              animationDelay: `${(index % 15) * -0.4}s`,
              animationDuration: `${2 + (index % 5) * 0.4}s`,
              height: `${12 + (index % 8) * 3}px`,
            }}
          />
        ))}
      </div>

      <div className="rain-overlay" aria-hidden="true" />

      <div className="library-layout">
        {/* Left side: Library introduction and books */}
        <section className="library-intro">
          <div className="brand">
            <span className="brand-icon">📚</span>
            <span>
              Campus<span className="brand-highlight">Reads</span>
            </span>
          </div>

          <p className="eyebrow">YOUR CAMPUS BOOK COMMUNITY</p>

          <h1>
            Rain outside.
            <br />
            <span>Stories inside.</span>
          </h1>

          <p className="intro-description">
            Find your next favorite book, discover what your
            classmates are reading, and share the stories that
            stay with you.
          </p>

          <div className="library-features">
            <div>
              <span className="feature-icon">☕</span>
              <span>Cozy reading moments</span>
            </div>

            <div>
              <span className="feature-icon">📖</span>
              <span>Books worth discovering</span>
            </div>

            <div>
              <span className="feature-icon">💬</span>
              <span>Reviews from your peers</span>
            </div>
          </div>

          <div className="books-section">
            <div className="books-heading">
              <h2>Rainy day reading list</h2>
              <span>CURATED FOR YOU</span>
            </div>

            <div className="book-gallery">
              {books.map((book) => (
                <article className="book-item" key={book.title}>
                  <div
                    className="book-cover"
                    style={{ backgroundColor: book.color }}
                  >
                    <img
                      src={book.cover}
                      alt={`${book.title} book cover`}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </div>

                  <p className="book-title">{book.title}</p>
                  <p className="book-author">{book.author}</p>
                </article>
              ))}
            </div>
          </div>

          <p className="rain-quote">
            “A little rain, a warm drink, and one more chapter.”
          </p>
        </section>

        {/* Right side: Login form */}
        <section className="login-card">
          <div className="login-book-icon">📖</div>

          <h2 className="login-brand">
            Campus<span className="brand-highlight">Reads</span>
          </h2>

          <p className="login-tagline">
            Your next chapter starts here.
          </p>

          <div className="welcome-message">
            <h3>Welcome back! ☔</h3>
            <p>Settle in and continue your reading journey.</p>
          </div>

          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email address</label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="password">Password</label>

            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <div className="login-options">
              <label className="remember-option">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) =>
                    setRemember(event.target.checked)
                  }
                />
                Remember me
              </label>

              <a
                href="#forgot-password"
                onClick={(event) => {
                  event.preventDefault();
                  setError("Password reset is not available yet.");
                  setSuccess("");
                }}
              >
                Forgot password?
              </a>
            </div>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            {success && (
              <p className="login-success" role="status">
                {success}
              </p>
            )}

            <button
              className="login-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <div className="login-divider">
            <span />
            <p>YOUR READING JOURNEY AWAITS</p>
            <span />
          </div>

          <p className="register-text">
            New to CampusReads?{" "}
            <a
              href="#register"
              onClick={(event) => {
                event.preventDefault();
                setError("Registration page is coming next.");
                setSuccess("");
              }}
            >
              Create an account
            </a>
          </p>

          <p className="login-footer">
            Made for readers, one page at a time. ✨
          </p>
        </section>
      </div>
    </main>
  );
}

export default App;


import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

import "./style.css";

// Shared Components
import Layout from "./components/Layout";

// Public Pages
import Home from "./pages/Home";
import Contact from "./Contact";
import ArticleDetails from "./pages/ArticleDetails";
import Articles from "./pages/Articles";

// Magazine & Book Pages
import Magazines from "./pages/Magazines";
import MagazineDetail from "./pages/MagazineDetail";
import Books from "./pages/Books";
import BookDetail from "./pages/BookDetail";
import BookReader from "./pages/BookReader";
import Upcoming from "./pages/Upcoming";

// Reader Authentication
import { ReaderAuthProvider } from "./context/ReaderAuthContext";

import ReaderLogin from "./pages/reader/ReaderLogin";
import ReaderRegister from "./pages/reader/ReaderRegister";
import SavedArticles from "./pages/reader/SavedArticles";
import ReaderProtectedRoute from "./components/reader/ReaderProtectedRoute";
import Profile from "./pages/reader/Profile";
import ReadingHistory from "./pages/reader/ReadingHistory";
import ReaderDashboard from "./pages/reader/ReaderDashboard";

// Admin Authentication
import { AdminAuthProvider } from "./context/AdminAuthContext";

import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ArticleManagement from "./pages/admin/ArticleManagement";
import ArticleEditor from "./pages/admin/ArticleEditor";
import EditArticle from "./pages/admin/EditArticle";
import ReaderManagement from "./pages/admin/ReaderManagement";
import ArticleSEO from "./pages/admin/ArticleSEO";

// Coming Soon Page
function ComingSoon({ title }) {
  return (
    <main className="st-coming-soon">
      <span className="eyebrow">
        SCROLLTHEORY / COMING SOON
      </span>

      <h1>{title}</h1>

      <p>
        Something thoughtful is on its way.
        We are preparing this space for curious minds.
      </p>

      <Link className="primary-button" to="/">
        Return Home ↗
      </Link>
    </main>
  );
}

// 404 Page
function NotFound() {
  return (
    <main className="st-coming-soon">
      <span className="eyebrow">
        SCROLLTHEORY / 404
      </span>

      <h1>Page not found.</h1>

      <p>
        The page you are looking for does not exist.
      </p>

      <Link className="primary-button" to="/">
        Back to Home ↗
      </Link>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <ReaderAuthProvider>
          <Routes>

            {/* =================================
                ADMIN LOGIN
            ================================= */}

            <Route
              path="/admin/login"
              element={<AdminLogin />}
            />

            <Route
              path="/admin"
              element={
                <Navigate
                  to="/admin/dashboard"
                  replace
                />
              }
            />

            {/* =================================
                PROTECTED ADMIN ROUTES
            ================================= */}

            <Route element={<AdminProtectedRoute />}>
              <Route element={<AdminLayout />}>

                <Route
                  path="/admin/dashboard"
                  element={<AdminDashboard />}
                />

                <Route
                  path="/admin/articles"
                  element={<ArticleManagement />}
                />

                <Route
                  path="/admin/articles/new"
                  element={<ArticleEditor />}
                />

                <Route
                  path="/admin/articles/:id/edit"
                  element={<EditArticle />}
                />

                <Route
                  path="/admin/readers"
                  element={<ReaderManagement />}
                />

                <Route
                  path="/admin/articles/:articleId/seo"
                  element={<ArticleSEO />}
                />

              </Route>
            </Route>

            {/* =================================
                PUBLIC WEBSITE
            ================================= */}

            <Route element={<Layout />}>

              {/* HOME */}
              <Route
                path="/"
                element={<Home />}
              />

              {/* ARTICLES */}
              <Route
                path="/articles"
                element={<Articles />}
              />

              <Route
                path="/articles/:slug"
                element={<ArticleDetails />}
              />

              {/* MAGAZINES */}
              <Route
                path="/magazines"
                element={<Magazines />}
              />

              <Route
                path="/magazines/:slug"
                element={<MagazineDetail />}
              />

              {/* Old URL Redirect */}
              <Route
                path="/magazine"
                element={
                  <Navigate
                    to="/magazines"
                    replace
                  />
                }
              />

              {/* BOOKS */}
              <Route
                path="/books"
                element={<Books />}
              />

              <Route
                path="/books/:slug"
                element={<BookDetail />}
              />

              {/* Book Reader */}
              <Route
                path="/books/:slug/read"
                element={<BookReader />}
              />

              {/* UPCOMING CONTENT */}
              <Route
                path="/upcoming"
                element={<Upcoming />}
              />

              {/* =================================
                  READER AUTHENTICATION
              ================================= */}

              <Route
                path="/login"
                element={<ReaderLogin />}
              />

              <Route
                path="/register"
                element={<ReaderRegister />}
              />

              {/* =================================
                  PROTECTED READER ROUTES
              ================================= */}

              <Route element={<ReaderProtectedRoute />}>

                <Route
                  path="/reader/dashboard"
                  element={<ReaderDashboard />}
                />

                <Route
                  path="/saved-articles"
                  element={<SavedArticles />}
                />

                <Route
                  path="/profile"
                  element={<Profile />}
                />

                <Route
                  path="/reading-history"
                  element={<ReadingHistory />}
                />

              </Route>

              {/* =================================
                  OTHER PAGES
              ================================= */}

              <Route
                path="/about"
                element={
                  <ComingSoon title="Our Story" />
                }
              />

              <Route
                path="/contact"
                element={<Contact />}
              />

              {/* =================================
                  404
              ================================= */}

              <Route
                path="*"
                element={<NotFound />}
              />

            </Route>

          </Routes>
        </ReaderAuthProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;

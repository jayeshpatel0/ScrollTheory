
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./style.css";

// Shared components
import Layout from "./components/Layout";

// Public pages
import Home from "./pages/Home";
import Contact from "./Contact";
import ArticleDetails from "./pages/ArticleDetails";
import Articles from "./pages/Articles";

// Reader authentication
import { ReaderAuthProvider } from "./context/ReaderAuthContext";
import ReaderLogin from "./pages/reader/ReaderLogin";
import ReaderRegister from "./pages/reader/ReaderRegister";
import SavedArticles from "./pages/reader/SavedArticles";
import ReaderProtectedRoute from "./components/reader/ReaderProtectedRoute";
import Profile from "./pages/reader/Profile";
import ReadingHistory from "./pages/reader/ReadingHistory";
import ReaderDashboard from "./pages/reader/ReaderDashboard";

// Admin authentication
import { AdminAuthProvider } from "./context/AdminAuthContext";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ArticleManagement from "./pages/admin/ArticleManagement";
import ArticleEditor from "./pages/admin/ArticleEditor";
import EditArticle from "./pages/admin/EditArticle";
import ReaderManagement from "./pages/admin/ReaderManagement";
import ArticleSEO from "./pages/admin/ArticleSEO";

// Coming Soon page
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

      <a className="primary-button" href="/">
        Return Home ↗
      </a>
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

      <a className="primary-button" href="/">
        Back to Home ↗
      </a>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <ReaderAuthProvider>
          <Routes>
            {/* =========================
                ADMIN LOGIN
            ========================= */}

            <Route
              path="/admin/login"
              element={<AdminLogin />}
            />

            {/* Admin root redirect */}
            <Route
              path="/admin"
              element={
                <Navigate
                  to="/admin/dashboard"
                  replace
                />
              }
            />

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

            {/* =========================
                PUBLIC WEBSITE
            ========================= */}

            <Route element={<Layout />}>
              {/* Home */}
              <Route
                path="/"
                element={<Home />}
              />

              {/* Contact */}
              <Route
                path="/contact"
                element={<Contact />}
              />

              {/* All articles */}
              <Route
                path="/articles"
                element={<Articles />}
              />

              {/* Single article */}
              <Route
                path="/articles/:slug"
                element={<ArticleDetails />}
              />

              {/* =========================
                  READER AUTHENTICATION
              ========================= */}

              <Route
                path="/login"
                element={<ReaderLogin />}
              />

              <Route
                path="/register"
                element={<ReaderRegister />}
              />


              {/* =========================
    PROTECTED READER PAGES
========================= */}

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



              {/* =========================
                  OTHER PAGES
              ========================= */}

              <Route
                path="/magazine"
                element={
                  <ComingSoon title="The Digital Magazine" />
                }
              />

              <Route
                path="/books"
                element={
                  <ComingSoon title="Your Digital Bookshelf" />
                }
              />

              <Route
                path="/about"
                element={
                  <ComingSoon title="Our Story" />
                }
              />

              {/* =========================
                  404
              ========================= */}

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

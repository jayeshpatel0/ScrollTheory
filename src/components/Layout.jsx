
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Layout() {
  return (
    <div className="st-site-layout">
      <Navbar />

      <div className="st-page-content">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}

export default Layout;

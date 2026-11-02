
const jwt = require("jsonwebtoken");

exports.protectAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization header.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "scrolltheory-api",
      audience: "scrolltheory-admin",
    });

    if (decoded.role !== "admin" || !decoded.id) {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    req.admin = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

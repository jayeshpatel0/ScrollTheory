
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

/* =========================================
   PROTECT READER ROUTES
   Verify JWT + Current Account Status
========================================= */
exports.protectReader = async (req, res, next) => {
  try {
    // 1. Check authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token || !process.env.READER_JWT_SECRET) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication.",
      });
    }

    // 2. Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.READER_JWT_SECRET,
      {
        issuer: "scrolltheory-api",
        audience: "scrolltheory-reader",
      }
    );

    // 3. Validate reader claims
    if (
      decoded.role !== "reader" ||
      !Number.isSafeInteger(decoded.id) ||
      decoded.id <= 0
    ) {
      return res.status(403).json({
        success: false,
        message: "Reader access required.",
      });
    }

    // 4. Check current account status in database
    const [rows] = await pool.execute(
      `SELECT id, name, email, account_status
       FROM reader_users
       WHERE id = ?
       LIMIT 1`,
      [decoded.id]
    );

    // Account deleted or unavailable
    if (!rows.length) {
      return res.status(401).json({
        success: false,
        code: "READER_NOT_FOUND",
        message: "Reader account not found. Please login again.",
      });
    }

    const reader = rows[0];

    // 5. Reject blocked accounts
    if (reader.account_status !== "active") {
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_BLOCKED",
        message:
          "Your account has been blocked. Please contact support.",
      });
    }

    // 6. Attach current authenticated reader
    req.reader = {
      id: reader.id,
      name: reader.name,
      email: reader.email,
      role: "reader",
    };

    // 7. Continue
    return next();

  } catch (error) {
    // JWT verification errors
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired reader token.",
      });
    }

    // Database or unexpected error
    console.error("READER AUTH MIDDLEWARE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication service temporarily unavailable.",
    });
  }
};


const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

/* =========================================
   CREATE READER JWT TOKEN
========================================= */
const createReaderToken = (reader) => {
  if (!process.env.READER_JWT_SECRET) {
    throw new Error("Reader JWT secret is missing.");
  }

  return jwt.sign(
    {
      id: reader.id,
      email: reader.email,
      role: "reader",
    },
    process.env.READER_JWT_SECRET,
    {
      expiresIn: "7d",
      issuer: "scrolltheory-api",
      audience: "scrolltheory-reader",
    }
  );
};

/* =========================================
   REGISTER READER
   POST /api/reader/auth/register
========================================= */
exports.register = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();

    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const password = req.body.password;

    if (!name || !email || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    if (name.length > 100 || email.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Name or email is too long.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email.",
      });
    }

    // bcrypt maximum input: 72 UTF-8 bytes
    if (
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be 8+ characters and at most 72 UTF-8 bytes.",
      });
    }

    const [existing] = await pool.execute(
      `SELECT id
       FROM reader_users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await pool.execute(
      `INSERT INTO reader_users
        (name, email, password_hash)
       VALUES (?, ?, ?)`,
      [name, email, passwordHash]
    );

    const reader = {
      id: result.insertId,
      name,
      email,
    };

    const token = createReaderToken(reader);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: reader,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    console.error("Reader register error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to register right now.",
    });
  }
};

/* =========================================
   LOGIN READER
   POST /api/reader/auth/login
========================================= */
exports.login = async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const password = req.body.password;

    if (!email || typeof password !== "string" || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Include account_status
    const [rows] = await pool.execute(
      `SELECT
          id,
          name,
          email,
          password_hash,
          account_status
       FROM reader_users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const reader = rows[0];

    // Verify password
    const passwordMatches = await bcrypt.compare(
      password,
      reader.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Reject blocked accounts
    if (reader.account_status !== "active") {
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_BLOCKED",
        message:
          "Your account has been blocked. Please contact support.",
      });
    }

    // Create JWT only for active readers
    const token = createReaderToken(reader);

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: reader.id,
        name: reader.name,
        email: reader.email,
      },
    });
  } catch (error) {
    console.error("Reader login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login right now.",
    });
  }
};

/* =========================================
   GET LOGGED-IN READER PROFILE
   GET /api/reader/auth/me
========================================= */
exports.me = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
          id,
          name,
          email,
          created_at
       FROM reader_users
       WHERE id = ?
       LIMIT 1`,
      [req.reader.id]
    );

    if (!rows.length) {
      return res.status(401).json({
        success: false,
        message: "Reader account not found.",
      });
    }

    return res.json({
      success: true,
      user: rows[0],
    });
  } catch (error) {
    console.error("Reader profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load profile.",
    });
  }
};

/* =========================================
   UPDATE READER PROFILE
   Authenticated reader only
========================================= */
const updateReaderProfile = async (req, res) => {
  try {
    const name =
      typeof req.body.name === "string"
        ? req.body.name.trim()
        : "";

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name cannot exceed 100 characters.",
      });
    }

    // Update only authenticated reader
    const [result] = await pool.execute(
      `UPDATE reader_users
       SET name = ?
       WHERE id = ?`,
      [name, req.reader.id]
    );

    if (result.affectedRows === 0) {
      const [rows] = await pool.execute(
        `SELECT id
         FROM reader_users
         WHERE id = ?
         LIMIT 1`,
        [req.reader.id]
      );

      if (!rows.length) {
        return res.status(404).json({
          success: false,
          message: "Reader account not found.",
        });
      }
    }

    const [users] = await pool.execute(
      `SELECT id, name, email, created_at
       FROM reader_users
       WHERE id = ?
       LIMIT 1`,
      [req.reader.id]
    );

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "Reader account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: users[0],
    });
  } catch (error) {
    console.error("UPDATE READER PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
    });
  }
};

module.exports.updateReaderProfile = updateReaderProfile;

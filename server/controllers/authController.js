const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { pool } = require("../config/db");
const db = pool;

// Admin Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing.");
      return res.status(500).json({
        success: false,
        message: "Server configuration error.",
      });
    }

    // Find admin
    const [admins] = await db.query(
      `SELECT id, name, email, password_hash
       FROM admins
       WHERE email = ?
       LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const admin = admins[0];

    // Verify password
    const isMatch = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
        issuer: "scrolltheory-api",
        audience: "scrolltheory-admin",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to login right now.",
    });
  }
};

// Logged-in Admin Profile
exports.me = async (req, res) => {
  try {
    const [admins] = await db.query(
      `SELECT id, name, email, created_at
       FROM admins
       WHERE id = ?
       LIMIT 1`,
      [req.admin.id]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    return res.json({
      success: true,
      admin: {
        ...admins[0],
        role: "admin",
      },
    });
  } catch (error) {
    console.error("ADMIN PROFILE ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch admin profile.",
    });
  }
};

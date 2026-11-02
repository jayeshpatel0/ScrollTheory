
require("dotenv").config();

const bcrypt = require("bcryptjs");
const { pool } = require("./config/db");

async function createAdmin() {
  const name = "ScrollTheory Admin";
  const email = "admin@scrolltheory.com";
  const password = "Admin@12345";

  try {
    const [existing] = await pool.execute(
      "SELECT id FROM admins WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      console.log("Admin already exists!");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.execute(
      `INSERT INTO admins (name, email, password_hash)
       VALUES (?, ?, ?)`,
      [name, email, passwordHash]
    );

    console.log("Admin created successfully!");
    console.log("Email:", email);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
  } finally {
    await pool.end();
  }
}

createAdmin();

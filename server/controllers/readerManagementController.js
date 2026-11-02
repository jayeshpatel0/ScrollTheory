
const { pool } = require("../config/db");

// GET /api/admin/readers
const getReaders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );
    const search = String(req.query.search || "").trim();
    const offset = (page - 1) * limit;

    const searchValue = `%${search}%`;

    const [[countResult]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM reader_users
       WHERE name LIKE ? OR email LIKE ?`,
      [searchValue, searchValue]
    );

    const [readers] = await pool.query(
      `SELECT id, name, email, account_status, created_at
       FROM reader_users
       WHERE name LIKE ? OR email LIKE ?
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [searchValue, searchValue, limit, offset]
    );

    res.json({
      success: true,
      readers,
      pagination: {
        page,
        limit,
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit),
      },
    });
  } catch (error) {
    console.error("GET READERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch readers",
    });
  }
};

// GET /api/admin/readers/:id
const getReaderById = async (req, res) => {
  try {
    const readerId = Number(req.params.id);

    if (!Number.isSafeInteger(readerId) || readerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid reader ID",
      });
    }

    const [rows] = await pool.query(
      `SELECT id, name, email, account_status, created_at
       FROM reader_users
       WHERE id = ?
       LIMIT 1`,
      [readerId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Reader not found",
      });
    }

    res.json({ success: true, reader: rows[0] });
  } catch (error) {
    console.error("GET READER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch reader",
    });
  }
};

// PATCH /api/admin/readers/:id/status
const updateReaderStatus = async (req, res) => {
  try {
    const readerId = Number(req.params.id);
    const { account_status } = req.body;

    if (!Number.isSafeInteger(readerId) || readerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid reader ID",
      });
    }

    if (!["active", "blocked"].includes(account_status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or blocked",
      });
    }

    const [result] = await pool.query(
      `UPDATE reader_users
       SET account_status = ?
       WHERE id = ?`,
      [account_status, readerId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Reader not found",
      });
    }

    res.json({
      success: true,
      message: `Reader ${account_status === "blocked" ? "blocked" : "activated"} successfully`,
    });
  } catch (error) {
    console.error("UPDATE READER STATUS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update reader status",
    });
  }
};

// DELETE /api/admin/readers/:id
const deleteReader = async (req, res) => {
  try {
    const readerId = Number(req.params.id);

    if (!Number.isSafeInteger(readerId) || readerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid reader ID",
      });
    }

    const [result] = await pool.query(
      "DELETE FROM reader_users WHERE id = ?",
      [readerId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Reader not found",
      });
    }

    res.json({
      success: true,
      message: "Reader deleted successfully",
    });
  } catch (error) {
    console.error("DELETE READER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Unable to delete reader. Check related database records.",
    });
  }
};

module.exports = {
  getReaders,
  getReaderById,
  updateReaderStatus,
  deleteReader,
};

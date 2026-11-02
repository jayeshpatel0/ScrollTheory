const express = require("express");
const router = express.Router();

const {
  getReaders,
  getReaderById,
  updateReaderStatus,
  deleteReader,
} = require("../controllers/readerManagementController");

const { protectAdmin } = require("../middleware/authMiddleware");

router.get("/", protectAdmin, getReaders);
router.get("/:id", protectAdmin, getReaderById);
router.patch("/:id/status", protectAdmin, updateReaderStatus);
router.delete("/:id", protectAdmin, deleteReader);

module.exports = router;
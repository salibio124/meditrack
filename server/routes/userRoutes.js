const express = require("express");
const router = express.Router();
const { getUsers, getRoles, createUser, toggleUserStatus, requestEmailOTP } = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

router.use(verifyToken);
router.get("/", requireRole("Administrator"), getUsers);
router.get("/roles", requireRole("Administrator"), getRoles);
router.post("/request-otp", requireRole("Administrator"), requestEmailOTP);
router.post("/", requireRole("Administrator"), createUser);
router.patch("/:id/toggle", requireRole("Administrator"), toggleUserStatus);

module.exports = router;

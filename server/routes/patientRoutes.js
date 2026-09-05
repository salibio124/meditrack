const express = require("express");
const router = express.Router();
const { getAllPatients, getPatientById, createPatient, updatePatient, toggleArchivePatient, deletePatient } = require("../controllers/patientController");
const verifyToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

router.use(verifyToken);
router.get("/", getAllPatients);
router.get("/:id", getPatientById);
router.post("/", requireRole("Administrator", "BHW"), createPatient);
router.put("/:id", requireRole("Administrator", "BHW"), updatePatient);
router.patch("/:id/archive", requireRole("Administrator"), toggleArchivePatient);
router.delete("/:id", requireRole("Administrator", "BHW"), deletePatient);

module.exports = router;

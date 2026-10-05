const express = require("express");

const {
    getStatistics,
    getAllEnrollments
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();


// Admin statistics
router.get(
    "/statistics",
    authMiddleware,
    adminMiddleware,
    getStatistics
);


// View all enrollments
router.get(
    "/enrollments",
    authMiddleware,
    adminMiddleware,
    getAllEnrollments
);


module.exports = router;
const express = require("express");

const {
    enrollCourse,
    getMyEnrollments
} = require("../controllers/enrollmentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// Student enrollment
router.post(
    "/:courseId",
    authMiddleware,
    enrollCourse
);


// Logged-in student's courses
router.get(
    "/my",
    authMiddleware,
    getMyEnrollments
);


module.exports = router;
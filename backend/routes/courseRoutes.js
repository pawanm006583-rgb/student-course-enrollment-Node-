const express = require("express");

const {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
} = require("../controllers/courseController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();


// Anyone authenticated can view courses
router.get(
    "/",
    authMiddleware,
    getCourses
);


// View single course
router.get(
    "/:id",
    authMiddleware,
    getCourseById
);


// Admin only
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    createCourse
);


// Admin only
router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    updateCourse
);


// Admin only
router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    deleteCourse
);


module.exports = router;
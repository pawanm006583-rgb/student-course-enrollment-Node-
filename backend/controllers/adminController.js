const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");


// ==========================
// ADMIN STATISTICS
// ==========================
const getStatistics = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({
            role: "student"
        });

        const totalAdmins = await User.countDocuments({
            role: "admin"
        });

        const totalCourses = await Course.countDocuments();

        const totalEnrollments = await Enrollment.countDocuments();

        const courses = await Course.find()
            .select(
                "courseCode title instructor seatLimit enrolledCount"
            )
            .sort({ enrolledCount: -1 });

        res.status(200).json({
            success: true,

            statistics: {
                totalStudents,
                totalAdmins,
                totalCourses,
                totalEnrollments
            },

            courseStatistics: courses
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch statistics",
            error: error.message
        });
    }
};


// ==========================
// GET ALL ENROLLMENTS
// ==========================
const getAllEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find()
            .populate("student", "name email")
            .populate(
                "course",
                "courseCode title instructor"
            )
            .sort({ enrolledAt: -1 });

        res.status(200).json({
            success: true,
            count: enrollments.length,
            enrollments
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch enrollments",
            error: error.message
        });
    }
};


module.exports = {
    getStatistics,
    getAllEnrollments
};
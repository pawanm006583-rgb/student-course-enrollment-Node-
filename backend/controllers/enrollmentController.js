const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");


// ==========================
// ENROLL IN COURSE
// ==========================
const enrollCourse = async (req, res) => {
    try {
        const studentId = req.user._id;
        const { courseId } = req.params;

        // Find course
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Check duplicate enrollment
        const existingEnrollment = await Enrollment.findOne({
            student: studentId,
            course: courseId
        });

        if (existingEnrollment) {
            return res.status(409).json({
                success: false,
                message: "You are already enrolled in this course"
            });
        }

        // Check seat availability
        if (course.enrolledCount >= course.seatLimit) {
            return res.status(400).json({
                success: false,
                message: "Course is full. No seats available"
            });
        }

        // Create enrollment
        const enrollment = await Enrollment.create({
            student: studentId,
            course: courseId
        });

        // Increase enrolled count
        course.enrolledCount += 1;

        await course.save();

        const populatedEnrollment =
            await Enrollment.findById(enrollment._id)
                .populate("student", "name email")
                .populate("course", "courseCode title instructor");

        res.status(201).json({
            success: true,
            message: "Course enrollment successful",
            enrollment: populatedEnrollment
        });

    } catch (error) {

        // Duplicate database index protection
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "You are already enrolled in this course"
            });
        }

        res.status(500).json({
            success: false,
            message: "Enrollment failed",
            error: error.message
        });
    }
};


// ==========================
// MY ENROLLMENTS
// ==========================
const getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({
            student: req.user._id
        })
            .populate(
                "course",
                "courseCode title description instructor seatLimit enrolledCount"
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
    enrollCourse,
    getMyEnrollments
};
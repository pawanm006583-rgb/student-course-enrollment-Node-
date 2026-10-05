const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");


// ==========================
// GET ALL COURSES
// ==========================
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: courses.length,
            courses
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch courses",
            error: error.message
        });
    }
};


// ==========================
// GET SINGLE COURSE
// ==========================
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        res.status(200).json({
            success: true,
            course
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch course",
            error: error.message
        });
    }
};


// ==========================
// CREATE COURSE
// ==========================
const createCourse = async (req, res) => {
    try {
        const {
            courseCode,
            title,
            description,
            instructor,
            seatLimit
        } = req.body;

        if (
            !courseCode ||
            !title ||
            !description ||
            !instructor ||
            seatLimit === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All course fields are required"
            });
        }

        if (!Number.isInteger(Number(seatLimit)) || Number(seatLimit) < 1) {
            return res.status(400).json({
                success: false,
                message: "Seat limit must be a positive integer"
            });
        }

        const existingCourse = await Course.findOne({
            courseCode: courseCode.toUpperCase()
        });

        if (existingCourse) {
            return res.status(409).json({
                success: false,
                message: "Course code already exists"
            });
        }

        const course = await Course.create({
            courseCode,
            title,
            description,
            instructor,
            seatLimit
        });

        res.status(201).json({
            success: true,
            message: "Course created successfully",
            course
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create course",
            error: error.message
        });
    }
};


// ==========================
// UPDATE COURSE
// ==========================
const updateCourse = async (req, res) => {
    try {
        const {
            courseCode,
            title,
            description,
            instructor,
            seatLimit
        } = req.body;

        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        if (seatLimit !== undefined) {
            if (
                !Number.isInteger(Number(seatLimit)) ||
                Number(seatLimit) < course.enrolledCount
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Seat limit cannot be less than current enrollment (${course.enrolledCount})`
                });
            }

            course.seatLimit = Number(seatLimit);
        }

        if (courseCode) course.courseCode = courseCode;
        if (title) course.title = title;
        if (description) course.description = description;
        if (instructor) course.instructor = instructor;

        await course.save();

        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            course
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update course",
            error: error.message
        });
    }
};


// ==========================
// DELETE COURSE
// ==========================
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        if (course.enrolledCount > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete a course with active enrollments"
            });
        }

        await Course.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete course",
            error: error.message
        });
    }
};


module.exports = {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
};
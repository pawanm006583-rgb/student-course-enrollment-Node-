const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
    {
        courseCode: {
            type: String,
            required: [true, "Course code is required"],
            unique: true,
            trim: true,
            uppercase: true
        },

        title: {
            type: String,
            required: [true, "Course title is required"],
            trim: true
        },

        description: {
            type: String,
            required: [true, "Course description is required"],
            trim: true
        },

        instructor: {
            type: String,
            required: [true, "Instructor is required"],
            trim: true
        },

        seatLimit: {
            type: Number,
            required: [true, "Seat limit is required"],
            min: [1, "Seat limit must be at least 1"]
        },

        enrolledCount: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Course", courseSchema);
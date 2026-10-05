import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";


function Admin() {
    const navigate = useNavigate();

    // ================================
    // STATE
    // ================================

const [statistics, setStatistics] = useState(null);
const [courses, setCourses] = useState([]);
const [enrollments, setEnrollments] = useState([]);
const [editingCourse, setEditingCourse] = useState(null);

const [formData, setFormData] = useState({
    courseCode: "",
    title: "",
    description: "",
    instructor: "",
    seatLimit: "",
});

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ================================
    // CHECK ADMIN + LOAD DATA
    // ================================

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            navigate("/login");
            return;
        }

        try {
            const user = JSON.parse(storedUser);

            if (user.role !== "admin") {
                navigate("/dashboard");
                return;
            }

            loadAdminData();
        } catch (err) {
            console.error("Invalid user data:", err);

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            navigate("/login");
        }
    }, [navigate]);

    // ================================
    // LOAD ADMIN DATA
    // ================================

    const loadAdminData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                statisticsResponse,
                coursesResponse,
                enrollmentsResponse,
            ] = await Promise.all([
                api.get("/admin/statistics"),
                api.get("/courses"),
                api.get("/admin/enrollments"),
            ]);

            setStatistics(
                statisticsResponse.data.statistics
            );

            setCourses(
                coursesResponse.data.courses || []
            );

            setEnrollments(
                enrollmentsResponse.data.enrollments || []
            );
        } catch (err) {
            console.error("Admin data error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load admin dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    // ================================
    // HANDLE FORM CHANGE
    // ================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };

    // ================================
    // CREATE COURSE
    // ================================

    const handleCreateCourse = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (
            !formData.courseCode.trim() ||
            !formData.title.trim() ||
            !formData.description.trim() ||
            !formData.instructor.trim() ||
            !formData.seatLimit
        ) {
            setError("Please fill all course fields.");
            return;
        }

        if (Number(formData.seatLimit) < 1) {
            setError("Seat limit must be at least 1.");
            return;
        }

        try {
            await api.post("/courses", {
                courseCode: formData.courseCode.trim(),
                title: formData.title.trim(),
                description: formData.description.trim(),
                instructor: formData.instructor.trim(),
                seatLimit: Number(formData.seatLimit),
            });

            setMessage("Course created successfully.");

            setFormData({
                courseCode: "",
                title: "",
                description: "",
                instructor: "",
                seatLimit: "",
            });

            await loadAdminData();
        } catch (err) {
            console.error("Create course error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to create course."
            );
        }
    };


// ================================
// UPDATE COURSE
// ================================

const handleUpdateCourse = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
        !editingCourse.courseCode.trim() ||
        !editingCourse.title.trim() ||
        !editingCourse.description.trim() ||
        !editingCourse.instructor.trim() ||
        !editingCourse.seatLimit
    ) {
        setError("Please fill all course fields.");
        return;
    }

    if (Number(editingCourse.seatLimit) < 1) {
        setError("Seat limit must be at least 1.");
        return;
    }

    try {
        await api.put(`/courses/${editingCourse._id}`, {
            courseCode: editingCourse.courseCode.trim(),
            title: editingCourse.title.trim(),
            description: editingCourse.description.trim(),
            instructor: editingCourse.instructor.trim(),
            seatLimit: Number(editingCourse.seatLimit),
        });

        setMessage("Course updated successfully.");

        setEditingCourse(null);

        await loadAdminData();
    } catch (err) {
        console.error("Update course error:", err);

        setError(
            err.response?.data?.message ||
            "Failed to update course."
        );
    }
};

    // ================================
    // DELETE COURSE
    // ================================

    const handleDelete = async (courseId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this course?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setMessage("");
            setError("");

            await api.delete(`/courses/${courseId}`);

            setMessage("Course deleted successfully.");

            await loadAdminData();
        } catch (err) {
            console.error("Delete course error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to delete course."
            );
        }
    };

    // ================================
    // LOGOUT
    // ================================

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    // ================================
    // LOADING SCREEN
    // ================================

    if (loading) {
        return (
            <div className="admin-loading">
                Loading admin dashboard...
            </div>
        );
    }

    // ================================
    // ADMIN DASHBOARD
    // ================================

    return (
        <div className="admin-page">

            {/* ================================
                HEADER
            ================================= */}

            <header className="admin-header">

                <div className="admin-brand">

                    <div className="brand-icon">
                        SC
                    </div>

                    <div>
                        <h1>
                            Student<span>Hub</span>
                        </h1>

                        <p>
                            Admin Dashboard
                        </p>
                    </div>

                </div>

                <div className="admin-user">

                    <div>
                        <strong>
                            Administrator
                        </strong>

                        <small>
                            Admin Account
                        </small>
                    </div>

                    <button
                        className="logout-btn"
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>

            </header>

            {/* ================================
                MAIN CONTENT
            ================================= */}

            <main className="admin-container">

                {/* PAGE TITLE */}

                <div className="admin-title">

                    <div>

                        <span className="section-label">
                            ADMIN PANEL
                        </span>

                        <h2>
                            University Overview
                        </h2>

                        <p>
                            Manage courses and monitor enrollment activity.
                        </p>

                    </div>

                </div>

                {/* ================================
                    ALERTS
                ================================= */}

                {message && (
                    <div className="admin-alert success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="admin-alert error">
                        {error}
                    </div>
                )}

                {/* ================================
                    STATISTICS
                ================================= */}

                <section className="stats-grid">

                    <div className="stat-card">

                        <span>
                            Total Students
                        </span>

                        <strong>
                            {statistics?.totalStudents || 0}
                        </strong>

                    </div>

                    <div className="stat-card">

                        <span>
                            Total Courses
                        </span>

                        <strong>
                            {statistics?.totalCourses || 0}
                        </strong>

                    </div>

                    <div className="stat-card">

                        <span>
                            Total Enrollments
                        </span>

                        <strong>
                            {statistics?.totalEnrollments || 0}
                        </strong>

                    </div>

                    <div className="stat-card">

                        <span>
                            Administrators
                        </span>

                        <strong>
                            {statistics?.totalAdmins || 0}
                        </strong>

                    </div>

                </section>

                {/* ================================
                    CREATE COURSE
                ================================= */}

                <section className="admin-section">

                    <div className="section-heading">

                        <div>

                            <span className="section-label">
                                COURSE MANAGEMENT
                            </span>

                            <h2>
                                Add New Course
                            </h2>

                        </div>

                    </div>

                    <form
                        className="course-form"
                        onSubmit={handleCreateCourse}
                    >

                        {/* COURSE CODE + TITLE */}

                        <div className="form-row">

                            <div className="form-group">

                                <label>
                                    Course Code
                                </label>

                                <input
                                    type="text"
                                    name="courseCode"
                                    placeholder="CS201"
                                    value={formData.courseCode}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Course Title
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Database Management"
                                    value={formData.title}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>

                        {/* INSTRUCTOR + SEAT LIMIT */}

                        <div className="form-row">

                            <div className="form-group">

                                <label>
                                    Instructor
                                </label>

                                <input
                                    type="text"
                                    name="instructor"
                                    placeholder="Dr. Sharma"
                                    value={formData.instructor}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Seat Limit
                                </label>

                                <input
                                    type="number"
                                    name="seatLimit"
                                    min="1"
                                    placeholder="30"
                                    value={formData.seatLimit}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>

                        {/* DESCRIPTION */}

                        <div className="form-group">

                            <label>
                                Description
                            </label>

                            <textarea
                                name="description"
                                placeholder="Enter course description..."
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                            />

                        </div>

                        {/* SUBMIT */}

                        <button
                            type="submit"
                            className="primary-btn"
                        >
                            + Create Course
                        </button>

                    </form>

                </section>

                {/* ================================
                    COURSE MANAGEMENT
                ================================= */}

                <section className="admin-section">

                    <div className="section-heading">

                        <div>

                            <span className="section-label">
                                COURSES
                            </span>

                            <h2>
                                Course Management
                            </h2>

                        </div>

                        <span className="course-count">
                            {courses.length} courses
                        </span>

                    </div>

                    <div className="admin-course-list">

                        {courses.length === 0 ? (

                            <div className="empty-state">
                                No courses available.
                            </div>

                        ) : (

                            courses.map((course) => (

                                <div
                                    className="admin-course-card"
                                    key={course._id}
                                >

                                    {/* COURSE DETAILS */}

                                    <div className="course-main">

                                        <div className="course-code">
                                            {course.courseCode}
                                        </div>

                                        <h3>
                                            {course.title}
                                        </h3>

                                        <p>
                                            {course.description}
                                        </p>

                                        <span>
                                            Instructor:{" "}
                                            <strong>
                                                {course.instructor}
                                            </strong>
                                        </span>

                                    </div>

                                    {/* COURSE INFORMATION */}

                                    <div className="course-info">

                                        <div>

                                            <small>
                                                Enrollment
                                            </small>

                                            <strong>
                                                {course.enrolledCount || 0}/
                                                {course.seatLimit}
                                            </strong>

                                        </div>

                                        <div>

                                            <small>
                                                Seats Available
                                            </small>

                                            <strong>
                                                {Math.max(
                                                    (course.seatLimit || 0) -
                                                    (course.enrolledCount || 0),
                                                    0
                                                )}
                                            </strong>

                                        </div>

                                        <div className="course-actions">

                                        <button
                                            className="edit-btn"
                                            onClick={() => setEditingCourse(course)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                handleDelete(course._id)
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                    </div>

                                </div>

                            ))

                        )}

                    </div>

                </section>
                        {/* ================================
    EDIT COURSE
================================= */}

{editingCourse && (
    <section className="admin-section edit-course-section">

        <div className="section-heading">

            <div>
                <span className="section-label">
                    COURSE MANAGEMENT
                </span>

                <h2>
                    Edit Course
                </h2>
            </div>

            <button
                className="cancel-btn"
                onClick={() => setEditingCourse(null)}
            >
                Cancel
            </button>

        </div>

        <form
            className="course-form"
            onSubmit={handleUpdateCourse}
        >

            <div className="form-row">

                <div className="form-group">

                    <label>
                        Course Code
                    </label>

                    <input
                        type="text"
                        value={editingCourse.courseCode}
                        onChange={(e) =>
                            setEditingCourse({
                                ...editingCourse,
                                courseCode: e.target.value,
                            })
                        }
                    />

                </div>

                <div className="form-group">

                    <label>
                        Course Title
                    </label>

                    <input
                        type="text"
                        value={editingCourse.title}
                        onChange={(e) =>
                            setEditingCourse({
                                ...editingCourse,
                                title: e.target.value,
                            })
                        }
                    />

                </div>

            </div>

            <div className="form-row">

                <div className="form-group">

                    <label>
                        Instructor
                    </label>

                    <input
                        type="text"
                        value={editingCourse.instructor}
                        onChange={(e) =>
                            setEditingCourse({
                                ...editingCourse,
                                instructor: e.target.value,
                            })
                        }
                    />

                </div>

                <div className="form-group">

                    <label>
                        Seat Limit
                    </label>

                    <input
                        type="number"
                        min="1"
                        value={editingCourse.seatLimit}
                        onChange={(e) =>
                            setEditingCourse({
                                ...editingCourse,
                                seatLimit: e.target.value,
                            })
                        }
                    />

                </div>

            </div>

            <div className="form-group">

                <label>
                    Description
                </label>

                <textarea
                    rows="4"
                    value={editingCourse.description}
                    onChange={(e) =>
                        setEditingCourse({
                            ...editingCourse,
                            description: e.target.value,
                        })
                    }
                />

            </div>

            <button
                type="submit"
                className="primary-btn"
            >
                Save Changes
            </button>

        </form>

    </section>
)}
                {/* ================================
                    ALL STUDENT ENROLLMENTS
                ================================= */}

                <section className="admin-section">

                    <div className="section-heading">

                        <div>

                            <span className="section-label">
                                ENROLLMENT ACTIVITY
                            </span>

                            <h2>
                                All Student Enrollments
                            </h2>

                        </div>

                        <span className="course-count">
                            {enrollments.length} enrollments
                        </span>

                    </div>

                    {enrollments.length === 0 ? (

                        <div className="empty-state">
                            No student enrollments yet.
                        </div>

                    ) : (

                        <div className="enrollment-table">

                            {/* TABLE HEADER */}

                            <div className="table-header">

                                <span>
                                    Student
                                </span>

                                <span>
                                    Email
                                </span>

                                <span>
                                    Course
                                </span>

                                <span>
                                    Enrolled On
                                </span>

                            </div>

                            {/* TABLE ROWS */}

                            {enrollments.map((enrollment) => (

                                <div
                                    className="table-row"
                                    key={enrollment._id}
                                >

                                    <span>

                                        <strong>
                                            {enrollment.student?.name ||
                                                "Unknown Student"}
                                        </strong>

                                    </span>

                                    <span>
                                        {enrollment.student?.email ||
                                            "N/A"}
                                    </span>

                                    <span>

                                        <strong className="course-code">
                                            {enrollment.course?.courseCode ||
                                                "N/A"}
                                        </strong>

                                        {" "}

                                        {enrollment.course?.title ||
                                            "Unknown Course"}

                                    </span>

                                    <span>

                                        {enrollment.enrolledAt
                                            ? new Date(
                                                  enrollment.enrolledAt
                                              ).toLocaleDateString()
                                            : "N/A"}

                                    </span>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default Admin;
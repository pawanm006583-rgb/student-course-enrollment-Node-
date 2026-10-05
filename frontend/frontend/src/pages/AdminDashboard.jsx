import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminDashboard() {
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [courses, setCourses] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        courseCode: "",
        title: "",
        description: "",
        instructor: "",
        seatLimit: "",
    });

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        if (!user || user.role !== "admin") {
            navigate("/login");
            return;
        }

        loadAdminData();
    }, []);

    const loadAdminData = async () => {
        try {
            setLoading(true);
            setError("");

            const [statsResponse, enrollmentResponse, coursesResponse] =
                await Promise.all([
                    api.get("/admin/statistics"),
                    api.get("/admin/enrollments"),
                    api.get("/courses"),
                ]);

            setStats(statsResponse.data.statistics);
            setEnrollments(enrollmentResponse.data.enrollments);
            setCourses(coursesResponse.data.courses);
        } catch (err) {
            console.error(err);

            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load admin dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();

        try {
            await api.post("/courses", {
                ...formData,
                seatLimit: Number(formData.seatLimit),
            });

            setFormData({
                courseCode: "",
                title: "",
                description: "",
                instructor: "",
                seatLimit: "",
            });

            setShowForm(false);

            await loadAdminData();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to create course."
            );
        }
    };

    const handleDeleteCourse = async (courseId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this course?"
        );

        if (!confirmed) return;

        try {
            await api.delete(`/courses/${courseId}`);
            await loadAdminData();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to delete course."
            );
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="loading-page">
                Loading admin dashboard...
            </div>
        );
    }

    return (
        <div className="admin-page">

            {/* NAVBAR */}
            <header className="topbar">
                <div className="topbar-inner">

                    <div className="brand">
                        <div className="brand-icon">SC</div>

                        <h2>
                            Student<span>Hub</span>
                        </h2>
                    </div>

                    <div className="user-area">

                        <div className="user-info">
                            <strong>{user?.name}</strong>
                            <span>{user?.email}</span>
                        </div>

                        <span className="admin-badge">
                            ADMIN
                        </span>

                        <button
                            className="logout-btn"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </div>
            </header>


            {/* MAIN */}
            <main className="admin-main">

                <div className="admin-heading">

                    <div>
                        <span className="section-label">
                            ADMIN PANEL
                        </span>

                        <h1>
                            Dashboard
                        </h1>

                        <p>
                            Manage courses and monitor student enrollments.
                        </p>
                    </div>

                    <button
                        className="primary-btn"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? "Cancel" : "+ Add Course"}
                    </button>

                </div>


                {error && (
                    <div className="alert error">
                        {error}
                    </div>
                )}


                {/* STATISTICS */}
                {stats && (
                    <div className="stats-grid">

                        <div className="stat-card">
                            <span>Total Students</span>
                            <strong>{stats.totalStudents}</strong>
                            <small>Registered students</small>
                        </div>

                        <div className="stat-card">
                            <span>Total Courses</span>
                            <strong>{stats.totalCourses}</strong>
                            <small>Available courses</small>
                        </div>

                        <div className="stat-card">
                            <span>Total Enrollments</span>
                            <strong>{stats.totalEnrollments}</strong>
                            <small>Course registrations</small>
                        </div>

                        <div className="stat-card">
                            <span>Administrators</span>
                            <strong>{stats.totalAdmins}</strong>
                            <small>System admins</small>
                        </div>

                    </div>
                )}


                {/* CREATE COURSE */}
                {showForm && (
                    <section className="admin-section">

                        <div className="section-header">
                            <div>
                                <h2>Add New Course</h2>
                                <p>
                                    Create a new course for students.
                                </p>
                            </div>
                        </div>

                        <form
                            className="course-form"
                            onSubmit={handleCreateCourse}
                        >

                            <div className="form-row">

                                <div className="form-group">
                                    <label>Course Code</label>

                                    <input
                                        name="courseCode"
                                        placeholder="CS201"
                                        value={formData.courseCode}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Course Title</label>

                                    <input
                                        name="title"
                                        placeholder="Operating Systems"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                            </div>


                            <div className="form-row">

                                <div className="form-group">
                                    <label>Instructor</label>

                                    <input
                                        name="instructor"
                                        placeholder="Dr. Sharma"
                                        value={formData.instructor}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Seat Limit</label>

                                    <input
                                        type="number"
                                        min="1"
                                        name="seatLimit"
                                        placeholder="50"
                                        value={formData.seatLimit}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                            </div>


                            <div className="form-group">
                                <label>Description</label>

                                <textarea
                                    name="description"
                                    placeholder="Enter course description..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>


                            <button
                                type="submit"
                                className="primary-btn"
                            >
                                Create Course
                            </button>

                        </form>

                    </section>
                )}


                {/* COURSE MANAGEMENT */}
                <section className="admin-section">

                    <div className="section-header">

                        <div>
                            <span className="section-label">
                                MANAGEMENT
                            </span>

                            <h2>Courses</h2>

                            <p>
                                Manage courses offered by the university.
                            </p>
                        </div>

                        <span className="count-label">
                            {courses.length} courses
                        </span>

                    </div>


                    <div className="admin-course-list">

                        {courses.length === 0 ? (

                            <div className="empty-state">
                                No courses available.
                            </div>

                        ) : (

                            courses.map((course) => {

                                const seatsLeft =
                                    course.seatLimit -
                                    course.enrolledCount;

                                return (
                                    <div
                                        className="admin-course-card"
                                        key={course._id}
                                    >

                                        <div className="course-main">

                                            <span className="course-code">
                                                {course.courseCode}
                                            </span>

                                            <h3>
                                                {course.title}
                                            </h3>

                                            <p>
                                                {course.description}
                                            </p>

                                            <span className="instructor">
                                                Instructor:{" "}
                                                {course.instructor}
                                            </span>

                                        </div>


                                        <div className="course-stats">

                                            <div>
                                                <span>Enrollment</span>
                                                <strong>
                                                    {course.enrolledCount}/
                                                    {course.seatLimit}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Seats Left</span>
                                                <strong>
                                                    {seatsLeft}
                                                </strong>
                                            </div>

                                        </div>


                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                handleDeleteCourse(
                                                    course._id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>
                                );
                            })

                        )}

                    </div>

                </section>


                {/* ENROLLMENTS */}
                <section className="admin-section">

                    <div className="section-header">

                        <div>
                            <span className="section-label">
                                STUDENT ACTIVITY
                            </span>

                            <h2>
                                Recent Enrollments
                            </h2>

                            <p>
                                View student course registrations.
                            </p>
                        </div>

                        <span className="count-label">
                            {enrollments.length} enrollments
                        </span>

                    </div>


                    <div className="enrollment-table">

                        <div className="table-header">
                            <span>Student</span>
                            <span>Course</span>
                            <span>Instructor</span>
                            <span>Date</span>
                        </div>


                        {enrollments.length === 0 ? (

                            <div className="empty-state">
                                No enrollments yet.
                            </div>

                        ) : (

                            enrollments.map((enrollment) => (

                                <div
                                    className="table-row"
                                    key={enrollment._id}
                                >

                                    <div>
                                        <strong>
                                            {enrollment.student?.name}
                                        </strong>

                                        <small>
                                            {enrollment.student?.email}
                                        </small>
                                    </div>

                                    <span>
                                        {enrollment.course?.courseCode} —{" "}
                                        {enrollment.course?.title}
                                    </span>

                                    <span>
                                        {enrollment.course?.instructor}
                                    </span>

                                    <span>
                                        {new Date(
                                            enrollment.enrolledAt
                                        ).toLocaleDateString()}
                                    </span>

                                </div>

                            ))

                        )}

                    </div>

                </section>

            </main>

        </div>
    );
}

export default AdminDashboard;
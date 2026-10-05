import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const [coursesResponse, enrollmentsResponse] =
                await Promise.all([
                    api.get("/courses"),
                    api.get("/enrollments/my"),
                ]);

            setCourses(coursesResponse.data.courses || []);
            setEnrollments(enrollmentsResponse.data.enrollments || []);

        } catch (err) {
            console.error(err);

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            setMessage("");
            setError("");

            await api.post(`/enrollments/${courseId}`);

            setMessage("Course enrolled successfully.");

            await fetchDashboardData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to enroll in this course."
            );
        }
    };

    const isEnrolled = (courseId) => {
        return enrollments.some(
            (enrollment) =>
                enrollment.course?._id === courseId
        );
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">

            {/* Navbar */}
            <nav className="dashboard-nav">

                <div className="dashboard-brand">
                    <div className="brand-icon small">
                        SC
                    </div>

                    <span>
                        Student<span>Hub</span>
                    </span>
                </div>

                <div className="dashboard-user">

                    <div className="user-info">
                        <strong>{user.name || "Student"}</strong>
                        <span>{user.email}</span>
                    </div>

                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </nav>

            {/* Main Content */}
            <main className="dashboard-main">

                {/* Welcome */}
                <section className="welcome-section">

                    <div>
                        <p className="eyebrow">
                            STUDENT DASHBOARD
                        </p>

                        <h1>
                            Welcome back, {user.name?.split(" ")[0] || "Student"} 👋
                        </h1>

                        <p>
                            Explore courses and manage your enrollments.
                        </p>
                    </div>

                    <div className="dashboard-stat">
                        <span>My Courses</span>
                        <strong>{enrollments.length}</strong>
                    </div>

                </section>

                {/* Messages */}

                {message && (
                    <div className="alert success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="alert error">
                        {error}
                    </div>
                )}

                {/* Available Courses */}
                <section className="dashboard-section">

                    <div className="section-heading">
                        <div>
                            <h2>Available Courses</h2>
                            <p>
                                Browse courses offered by the university.
                            </p>
                        </div>

                        <span className="course-count">
                            {courses.length} courses
                        </span>
                    </div>

                    <div className="course-grid">

                        {courses.length === 0 ? (
                            <div className="empty-state">
                                <h3>No courses available</h3>
                                <p>
                                    New courses will appear here when
                                    they are added by the administrator.
                                </p>
                            </div>
                        ) : (
                            courses.map((course) => {

                                const availableSeats =
                                    course.seatLimit -
                                    course.enrolledCount;

                                const enrolled =
                                    isEnrolled(course._id);

                                return (
                                    <div
                                        className="course-card"
                                        key={course._id}
                                    >

                                        <div className="course-card-top">

                                            <span className="course-code">
                                                {course.courseCode}
                                            </span>

                                            <span
                                                className={
                                                    availableSeats > 0
                                                        ? "seat-badge available"
                                                        : "seat-badge full"
                                                }
                                            >
                                                {availableSeats > 0
                                                    ? `${availableSeats} seats left`
                                                    : "Full"}
                                            </span>

                                        </div>

                                        <h3>{course.title}</h3>

                                        <p className="course-description">
                                            {course.description}
                                        </p>

                                        <div className="course-meta">

                                            <div>
                                                <span>Instructor</span>
                                                <strong>
                                                    {course.instructor}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Enrollment</span>
                                                <strong>
                                                    {course.enrolledCount}/
                                                    {course.seatLimit}
                                                </strong>
                                            </div>

                                        </div>

                                        <button
                                            className={
                                                enrolled
                                                    ? "enrolled-btn"
                                                    : "primary-btn course-btn"
                                            }
                                            disabled={
                                                enrolled ||
                                                availableSeats <= 0
                                            }
                                            onClick={() =>
                                                handleEnroll(course._id)
                                            }
                                        >
                                            {enrolled
                                                ? "✓ Enrolled"
                                                : availableSeats <= 0
                                                    ? "Course Full"
                                                    : "Enroll Now"}
                                        </button>

                                    </div>
                                );
                            })
                        )}

                    </div>

                </section>

                {/* My Enrollments */}
                <section className="dashboard-section">

                    <div className="section-heading">

                        <div>
                            <h2>My Enrollments</h2>
                            <p>
                                Courses you are currently enrolled in.
                            </p>
                        </div>

                    </div>

                    {enrollments.length === 0 ? (

                        <div className="empty-state">
                            <h3>No enrollments yet</h3>
                            <p>
                                Choose a course above to get started.
                            </p>
                        </div>

                    ) : (

                        <div className="enrollment-list">

                            {enrollments.map((enrollment) => (

                                <div
                                    className="enrollment-card"
                                    key={enrollment._id}
                                >

                                    <div className="enrollment-icon">
                                        {enrollment.course?.courseCode?.substring(
                                            0,
                                            2
                                        )}
                                    </div>

                                    <div className="enrollment-info">

                                        <span>
                                            {enrollment.course?.courseCode}
                                        </span>

                                        <h3>
                                            {enrollment.course?.title}
                                        </h3>

                                        <p>
                                            Instructor:{" "}
                                            {enrollment.course?.instructor}
                                        </p>

                                    </div>

                                    <div className="enrollment-status">
                                        Enrolled
                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default Dashboard;
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!formData.name || !formData.email || !formData.password) {
            setError("Please fill in all fields.");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must contain at least 6 characters.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/auth/register", formData);

            setMessage(response.data.message);

            setFormData({
                name: "",
                email: "",
                password: "",
            });

            setTimeout(() => {
                navigate("/login");
            }, 1200);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">

                <div className="auth-brand">
                    <div className="brand-icon">SC</div>

                    <h1>Student<span>Hub</span></h1>

                    <p>
                        Your gateway to smarter course management.
                    </p>
                </div>

                <div className="auth-card">

                    <div className="auth-header">
                        <h2>Create Account</h2>
                        <p>Register as a student to continue</p>
                    </div>

                    {error && (
                        <div className="alert error">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="alert success">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="form-group">
                            <label>Full Name</label>

                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>

                            <input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>

                            <input
                                type="password"
                                name="password"
                                placeholder="Minimum 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            type="submit"
                            className="primary-btn"
                            disabled={loading}
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </button>

                    </form>

                    <div className="auth-footer">
                        Already have an account?{" "}
                        <Link to="/login">Sign in</Link>
                    </div>

                </div>

                <div className="auth-note">
                    Student Course Enrollment System
                </div>

            </div>
        </div>
    );
}

export default Register;
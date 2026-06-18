import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { Link,useNavigate  } from "react-router-dom";
import "../styles/login.css";


const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});


const Login = () => {
    const [serverError, setServerError] = useState("");


    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        try {
            setServerError("");
            const response = await axios.post("/api/auth/login", data, {
                withCredentials: true,
            });
            if (response.data) {
                alert("Logged in successfully!");
                navigate("/Dashboard");

            }
        } catch (error) {
            setServerError(
                error.response?.data?.error || "Invalid email or password"
            );
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Welcome Back</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                    {serverError && <div className="error-message">{serverError}</div>}

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" {...register("email")} placeholder="" />
                        {errors.email && <span className="field-error">{errors.email.message}</span>}
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" {...register("password")} placeholder="" />
                        {errors.password && <span className="field-error">{errors.password.message}</span>}
                    </div>

                    <button type="submit" className="auth-button">
                        Log In
                    </button>
                </form>
                <p className="auth-switch">
                    Don't have an account? <Link to="/Sign">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
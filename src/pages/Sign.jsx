import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/sign.css";

const signupSchema = z.object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const Sign = () => {
    const [serverError, setServerError] = useState("");
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data) => {
        try {
            setServerError("");
            const response = await api.post("/auth/signup", data);
            if (response.data) {
                navigate("/Login");
            }
        } catch (error) {
            setServerError(
                error.response?.data?.error || "Something went wrong during sign up"
            );
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Sign Up</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                    {serverError && <div className="error-message">{serverError}</div>}

                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" {...register("username")} placeholder="" />
                        {errors.username && <span className="field-error">{errors.username.message}</span>}
                    </div>

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
                        Sign Up
                    </button>
                </form>
                <p className="auth-switch">
                    Already have an account? <Link to="/Login">Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default Sign;
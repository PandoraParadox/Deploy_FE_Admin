import { useState } from "react";
import styles from "./login.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import 'react-toastify/dist/ReactToastify.css';
import { auth } from "../../firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import axiosInstance from "../../interceptor";


function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const idToken = await user.getIdToken();
            const response = await axiosInstance.post(`${process.env.REACT_APP_APP_API_URL}/api/v1/user/login/${idToken}`);
            if (response.status === 200) {
                login(idToken);

                toast.success("Login successful!", {
                    position: "top-center",
                    autoClose: 1500,
                    onClose: () => navigate("/admin-user")
                });
            }
        } catch (error) {
            console.error("Login failed:", error.code, error.message);
            toast.error("Wrong username or password!", {
                position: "top-center",
                autoClose: 2000
            });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const idToken = await user.getIdToken();
            const response = await axiosInstance.post(`${process.env.REACT_APP_APP_API_URL}/api/v1/user/login/${idToken}`);
            if (response.status === 200) {
                login(idToken);

                toast.success("Login successful!", {
                    position: "top-center",
                    autoClose: 1500,
                    onClose: () => navigate("/admin-user")
                });
            }
        } catch (error) {
            console.error("Google login error:", error.message);
            toast.error("Google Sign In Failed", {
                position: "top-center",
                autoClose: 2000
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginPage}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <img src="/Logo.jpg" alt="Logo" className={styles.logo} />
                    <h1 className={styles.appName}>Auction Online</h1>
                </div>
            </header>

            <div className={styles.loginContainer}>
                <div className={styles.loginCard}>
                    <h2 className={styles.loginTitle}>Welcome Back</h2>
                    <p className={styles.loginSubtitle}>Please login to continue</p>

                    <form onSubmit={handleSubmit} className={styles.loginForm}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.inputLabel}>Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.inputField}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password" className={styles.inputLabel}>Password</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={styles.inputField}
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={toggleShowPassword}
                                    className={styles.passwordToggle}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={styles.loginButton}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className={styles.spinner}></span>
                            ) : (
                                "Login"
                            )}
                        </button>

                        <div className={styles.divider}>
                            <span>OR</span>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className={styles.googleButton}
                            disabled={isLoading}
                        >
                            <FaGoogle className={styles.googleIcon} />
                            Continue with Google
                        </button>
                    </form>
                </div>
            </div>

            <ToastContainer />
        </div>
    );
}

export default Login;
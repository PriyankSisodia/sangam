import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;
// const API_BASE_URL = "http://localhost:8000"
const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | string[]>("");
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
//       const response = await axios.post("http://localhost:8000/login", {
        username: username,
        password: password,
      });

      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Full error:", err);
      console.error("Error response data:", err?.response?.data);
      setErrorMsg("Network error occurred. Please check server and CORS settings.");

//       const detail = err?.response?.data?.detail;

      console.error("Login error:", err);
      const detail = err?.response?.data?.detail;
      if (Array.isArray(detail)) {
        const messages = detail.map((d: any) => d.msg);
        setErrorMsg(messages);
      } else if (typeof detail === "object" && detail !== null) {
        // For cases where detail is an object, e.g. { error: "XYZ" }
        setErrorMsg(JSON.stringify(detail));
      } else if (typeof detail === "string") {
        setErrorMsg(detail);
      } else {
        setErrorMsg("FallBack! Error");
      }
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>Welcome Back</h2>
        <form style={styles.form} onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button
            type="submit"
            style={isHovered ? { ...styles.button, ...styles.buttonHover } : styles.button}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Login
          </button>
          {Array.isArray(errorMsg) ? (
            errorMsg.map((msg, idx) => (
              <p key={idx} style={styles.error}>
                {msg}
              </p>
            ))
          ) : (
            errorMsg && <p style={styles.error}>{errorMsg}</p>
          )}
        </form>
        <p style={styles.signupText}>
          Don’t have an account?{" "}
          <Link to="/signup" style={styles.signupLink}>
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
  },
  container: {
    width: "100%",
    maxWidth: "420px",
    padding: "40px 30px",
    textAlign: "center",
    background: "rgba(0, 0, 0, 0.2)",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.37)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#e0e0e0",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 700,
    color: "white",
    marginBottom: "1rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginTop: "2rem",
  },
  input: {
    padding: "15px",
    fontSize: "1rem",
    color: "white",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.3s, box-shadow 0.3s",
  },
  button: {
    padding: "15px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "white",
    background: "linear-gradient(90deg, #007bff, #0056b3)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    marginTop: "1rem",
  },
  buttonHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 20px rgba(0, 123, 255, 0.4)",
  },
  error: {
    color: "#ff4d4d",
    background: "rgba(255, 77, 77, 0.1)",
    border: "1px solid rgba(255, 77, 77, 0.2)",
    padding: "10px",
    borderRadius: "8px",
    marginTop: "10px",
    fontSize: "0.9rem",
  },
  signupText: {
    marginTop: "2rem",
    fontSize: "0.9rem",
    color: "#c0c0c0",
  },
  signupLink: {
    color: "#00aaff",
    fontWeight: 600,
    textDecoration: "none",
  },
};

export default Login;

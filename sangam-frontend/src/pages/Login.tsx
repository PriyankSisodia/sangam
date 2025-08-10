import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;
// const API_BASE_URL = "http://localhost:8000"
const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | string[]>("");

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
        <h2>Login</h2>
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
          <button type="submit" style={styles.button}>
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
        <p>
          Don’t have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#262626", // optional, for app background
    width: "100vw",
  },
  container: {
    width: "100%", // fill parent
    maxWidth: "400px",
    background: "#222", // optional, for card background
    textAlign: "center",
    padding: "30px",
    border: "1px solid #444",
    borderRadius: "8px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "1px solid #333",
    background: "#333",
    color: "white",
  },
  button: {
    padding: "10px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginTop: "10px",
  },
};

export default Login;

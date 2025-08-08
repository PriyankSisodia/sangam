// src/pages/Login.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

console.log("✅ Login.tsx loaded");

const Login: React.FC = () => {
  console.log("Login component mounted");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | string[]>("");

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(""); // clear previous errors

    console.log("Login payload:", { username: email, password });

    try {
      const response = await axios.post("http://localhost:8000/login", {
          username: email,
          password: password,
        });

      // Store token and navigate
      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);

      const detail = err?.response?.data?.detail;

      if (Array.isArray(detail)) {
        // FastAPI validation errors
        const messages = detail.map((d: any) => d.msg);
        setErrorMsg(messages);
      } else if (typeof detail === "string") {
        setErrorMsg(detail);
      } else {
        setErrorMsg("Login failed. Please try again.");
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <form style={styles.form} onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        <button type="submit" style={styles.button}>Login</button>

        {/* Error display */}
        {Array.isArray(errorMsg) ? (
          errorMsg.map((msg, idx) => (
            <p key={idx} style={styles.error}>{msg}</p>
          ))
        ) : (
          errorMsg && <p style={styles.error}>{errorMsg}</p>
        )}
      </form>

      <p>
        Don’t have an account? <Link to="/signup">Sign up here</Link>
      </p>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "400px",
    margin: "80px auto",
    textAlign: "center",
    padding: "30px",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
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

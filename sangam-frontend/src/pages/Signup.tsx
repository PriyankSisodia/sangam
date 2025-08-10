import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;
// const API_BASE_URL = "http://localhost:8000"
const Signup: React.FC = () => {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | string[]>("");

  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, {
//       const response = await axios.post("http://localhost:8000/signup", {
        business_name: businessName,
        username: email, // backend expects 'username' if following FastAPI OAuth2
        password: password,
      });

      console.log("Signup successful:", response.data);

      // Redirect to login after successful signup
      navigate("/");
    } catch (err: any) {
      console.error("Signup error:", err);
      const detail = err?.response?.data?.detail;
      if (Array.isArray(detail)) {
        const messages = detail.map((d: any) => d.msg);
        setErrorMsg(messages);
      } else if (typeof detail === "string") {
        setErrorMsg(detail);
      } else {
        setErrorMsg("Signup failed. Please try again.");
      }
    }
  };

  return (
      <div style={styles.wrapper}>
        <div style={styles.container}>
          <h2>Sign Up</h2>
          <form style={styles.form} onSubmit={handleSignup}>
            <input
              type="text"
              placeholder="Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="email"
              placeholder="Email"
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
            <button type="submit" style={styles.button}>Sign Up</button>

            {Array.isArray(errorMsg) ? (
              errorMsg.map((msg, idx) => (
                <p key={idx} style={styles.error}>{msg}</p>
              ))
            ) : (
              errorMsg && <p style={styles.error}>{errorMsg}</p>
            )}
          </form>
          <p>
            Already have an account? <Link to="/">Login</Link>
          </p>
        </div>
      </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#262626", // optional, for app background
    width: "100vw",
  },
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
    backgroundColor: "#28a745",
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

export default Signup;

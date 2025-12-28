import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Icon Components
const EmailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const LoginIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | string[]>("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Add CSS animations only once
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
      }
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      input:focus {
        border-color: #005bb5 !important;
        box-shadow: 0 0 0 3px rgba(0, 91, 181, 0.1) !important;
      }
      button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 91, 181, 0.4) !important;
      }
      button:active:not(:disabled) {
        transform: translateY(0);
      }
      a:hover {
        color: #005bb5 !important;
      }
    `;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username: username,
        password: password,
      });

      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard2");
    } catch (err: any) {
      console.error("Login error:", err);
      const detail = err?.response?.data?.detail;
      if (Array.isArray(detail)) {
        const messages = detail.map((d: any) => d.msg);
        setErrorMsg(messages);
      } else if (typeof detail === "object" && detail !== null) {
        setErrorMsg(JSON.stringify(detail));
      } else if (typeof detail === "string") {
        setErrorMsg(detail);
      } else {
        setErrorMsg("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Animated background gradient */}
      <div style={styles.backgroundGradient} />
      
      {/* Decorative shapes */}
      <div style={styles.shape1} />
      <div style={styles.shape2} />
      <div style={styles.shape3} />

      <div style={styles.container}>
        {/* Logo/Brand Section */}
        <div style={styles.header}>
          <div style={styles.logoCircle}>
            <LoginIcon width={32} height={32} />
          </div>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to continue to Sangam</p>
        </div>

        {/* Form Section */}
        <form style={styles.form} onSubmit={handleLogin}>
          {/* Email Input */}
          <div style={styles.inputGroup}>
            <div style={styles.inputIcon}>
              <EmailIcon width={20} height={20} />
            </div>
            <input
              type="email"
              placeholder="Email address"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div style={styles.inputGroup}>
            <div style={styles.inputIcon}>
              <LockIcon width={20} height={20} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              disabled={loading}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOffIcon width={20} height={20} />
              ) : (
                <EyeIcon width={20} height={20} />
              )}
            </button>
          </div>

          {/* Error Messages */}
          {Array.isArray(errorMsg) ? (
            errorMsg.map((msg, idx) => (
              <div key={idx} style={styles.error}>
                <span style={styles.errorIcon}>⚠️</span>
                {msg}
              </div>
            ))
          ) : (
            errorMsg && (
              <div style={styles.error}>
                <span style={styles.errorIcon}>⚠️</span>
                {errorMsg}
              </div>
            )
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            style={{
              ...styles.button,
              ...(loading ? styles.buttonLoading : {}),
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={styles.spinner} />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <LoginIcon width={18} height={18} style={{ marginLeft: '8px' }} />
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don't have an account?{" "}
            <Link to="/signup" style={styles.link}>
              Sign up here
            </Link>
          </p>
        </div>
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
    position: "relative" as const,
    overflow: "hidden" as const,
    background: "linear-gradient(175deg, #f4f7f9 0%, #e9edf2 100%)",
    backgroundImage: `linear-gradient(175deg, #f4f7f9 0%, #e9edf2 100%), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><g fill-rule="evenodd"><g fill="%23d6dee5" fill-opacity="0.2"><path d="M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z"/></g></g></svg>')`,
    padding: "20px",
    width: "100vw",
    boxSizing: "border-box" as const,
  },
  backgroundGradient: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(175deg, #f4f7f9 0%, #e9edf2 100%)",
    zIndex: 0,
  },
  shape1: {
    position: "absolute" as const,
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "rgba(0, 91, 181, 0.05)",
    top: "-150px",
    left: "-150px",
    zIndex: 1,
    animation: "float 8s ease-in-out infinite",
  },
  shape2: {
    position: "absolute" as const,
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "rgba(0, 123, 255, 0.04)",
    bottom: "-100px",
    right: "-100px",
    zIndex: 1,
    animation: "float 10s ease-in-out infinite",
  },
  shape3: {
    position: "absolute" as const,
    width: "250px",
    height: "250px",
    borderRadius: "50%",
    background: "rgba(0, 91, 181, 0.03)",
    top: "50%",
    right: "15%",
    zIndex: 1,
    animation: "float 12s ease-in-out infinite",
  },
  container: {
    width: "100%",
    maxWidth: "440px",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "48px 40px",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)",
    position: "relative" as const,
    zIndex: 2,
    animation: "slideUp 0.5s ease-out",
    margin: "0 auto",
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "40px",
  },
  logoCircle: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #005bb5 0%, #007bff 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
    color: "white",
    boxShadow: "0 8px 24px rgba(0, 91, 181, 0.3)",
  },
  title: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#1a202c",
    margin: "0 0 8px 0",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "16px",
    color: "#718096",
    margin: 0,
    fontWeight: 400,
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
  },
  inputGroup: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute" as const,
    left: "16px",
    color: "#a0aec0",
    zIndex: 1,
    pointerEvents: "none" as const,
  },
  input: {
    width: "100%",
    padding: "16px 16px 16px 48px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    background: "#ffffff",
    color: "#1a202c",
    transition: "all 0.2s",
    outline: "none",
    boxSizing: "border-box" as const,
  },
  eyeButton: {
    position: "absolute" as const,
    right: "16px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    padding: "8px",
    color: "#a0aec0",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    padding: "16px 24px",
    fontSize: "16px",
    fontWeight: 600,
    background: "linear-gradient(135deg, #005bb5 0%, #007bff 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "8px",
    boxShadow: "0 4px 12px rgba(0, 91, 181, 0.3)",
  },
  buttonLoading: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginRight: "8px",
  },
  error: {
    color: "#e53e3e",
    marginTop: "4px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    background: "#fed7d7",
    borderRadius: "8px",
    border: "1px solid #fc8181",
  },
  errorIcon: {
    fontSize: "16px",
  },
  footer: {
    marginTop: "32px",
    textAlign: "center" as const,
  },
  footerText: {
    fontSize: "14px",
    color: "#718096",
    margin: 0,
  },
  link: {
    color: "#005bb5",
    textDecoration: "none",
    fontWeight: 600,
    transition: "color 0.2s",
  },
};

export default Login;

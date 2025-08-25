import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
//         await axiosInstance.get("/users/me"); // Protected route
        await axiosInstance.get(`${API_BASE_URL}/users/me`);
        setLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          Welcome to <span style={styles.brand}>Sangam AI</span>
        </h1>
        <p style={styles.subtitle}>Empowering Education with Intelligence 🚀</p>
        <img
          src="https://plus.unsplash.com/premium_photo-1680608979589-e9349ed066d5?q=80&w=1364&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="AI"
          style={styles.image}
        />
        <p style={styles.note}>
          You’ve successfully logged in. More features coming soon.
        </p>
      </div>
    </div>
  );
};

// Add this at the top or bottom of your Dashboard.tsx
const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#262626",
    width: "100vw",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "#222",
    textAlign: "center",
    padding: "30px",
    border: "1px solid #444",
    borderRadius: "8px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
    color: "white",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "10px",
  },
  brand: {
    color: "#007bff",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: "1.2rem",
    marginBottom: "10px",
  },
  image: {
    width: "100%",
    maxHeight: "180px",
    objectFit: "cover",
    borderRadius: "6px",
    margin: "16px 0",
  },
  note: {
    fontStyle: "italic",
    marginTop: "16px",
  },
};

export default Dashboard;

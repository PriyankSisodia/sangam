import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axiosInstance.get("/users/me"); // Protected route
        setLoading(false);
      } catch (error) {
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


export default Dashboard;

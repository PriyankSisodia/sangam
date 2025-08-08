import React from "react";

const Dashboard: React.FC = () => {
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

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    width: "100vw",
    height: "100vh",
    margin: 0,
    padding: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to right, #e0eafc, #cfdef3)",
  },
  card: {
    width: "95%",
    maxWidth: "1200px",
    padding: "40px",
    borderRadius: "20px",
    backgroundColor: "#ffffff",
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.15)",
    textAlign: "center",
  },
  title: {
    fontSize: "3rem",
    marginBottom: "10px",
  },
  brand: {
    color: "#007bff",
  },
  subtitle: {
    fontSize: "1.5rem",
    color: "#555",
    marginBottom: "30px",
  },
  image: {
    width: "100%",
    height: "auto",
    maxHeight: "400px",
    objectFit: "contain",
    marginBottom: "30px",
  },
  note: {
    fontSize: "1.2rem",
    color: "#333",
  },
};

export default Dashboard;

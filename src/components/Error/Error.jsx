import { motion } from "framer-motion";
import { AlertOctagon, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Error() {
  const navigate = useNavigate();

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "60vh", padding: "2rem" }}
    >
      <motion.div
        className="glass-panel text-center p-5 animate-fade-in"
        style={{
          maxWidth: "500px",
          width: "100%",
          background: "rgba(13, 16, 28, 0.45)",
          borderColor: "rgba(239, 68, 68, 0.2)",
          boxShadow: "0 8px 32px rgba(239, 68, 68, 0.05)",
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div
          className="mx-auto mb-4 d-flex align-items-center justify-content-center"
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            boxShadow: "0 0 20px rgba(239, 68, 68, 0.15)",
            color: "#f87171",
          }}
        >
          <AlertOctagon size={40} className="pulse-danger" />
        </div>

        <h2 className="mb-3" style={{ fontSize: "1.75rem", fontWeight: 700 }}>
          Page Not Found
        </h2>
        
        <p
          className="text-secondary mb-4"
          style={{ fontSize: "0.95rem", lineHeight: "1.6" }}
        >
          The page you are looking for doesn't exist, has been moved, or the URL
          username path is incorrect. Let's get you back on track.
        </p>

        <button
          onClick={() => navigate("/")}
          className="btn btn-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2"
          style={{ fontSize: "1rem" }}
        >
          <ArrowLeft size={18} />
          Back to Search
        </button>
      </motion.div>
    </div>
  );
}

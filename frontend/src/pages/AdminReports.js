import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stack,
  alpha,
  CircularProgress,
  Alert,
  List,
  ListItemText,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

function AdminReports() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role !== "admin") {
      navigate("/login");
      return;
    }
    fetchPendingCases();
  }, [role, navigate]);

  const fetchPendingCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/case-types?pending_only=true", {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt_token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCases(data);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (caseId, approved) => {
    try {
      const response = await fetch(`http://localhost:8000/case-types/${caseId}/approval`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved }),
      });

      if (response.ok) {
        fetchPendingCases();
        alert("Case updated successfully");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to update status: ${response.statusText}`);
      }
    } catch (err) {
      console.error("Error updating case:", err);
      alert("Error: " + err.message);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: alpha('#f5f5f5', 0.5), py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Pending Case Type Suggestions</Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : cases.length > 0 ? (
          <List>
            {cases.map((caseItem) => (
              <MotionPaper key={caseItem._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ mb: 2, p: 3, borderRadius: 3 }}>
                <ListItemText
                  primary={<Typography variant="h6">{caseItem.name}</Typography>}
                  secondary={<Typography variant="body2" color="text.secondary">ID: {caseItem._id}</Typography>}
                />
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" color="success" onClick={() => handleUpdateStatus(caseItem._id, true)}>
                    Approve
                  </Button>
                  <Button variant="contained" color="error" onClick={() => handleUpdateStatus(caseItem._id, false)}>
                    Reject
                  </Button>
                </Stack>
              </MotionPaper>
            ))}
          </List>
        ) : (
          <Typography>No pending case types found.</Typography>
        )}
      </Container>
    </Box>
  );
}

export default AdminReports;

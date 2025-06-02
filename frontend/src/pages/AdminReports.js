import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  ListItem,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

function AdminReports() {
  const { t } = useTranslation();
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
    fetchCases();
  }, [role, navigate]);

  const fetchCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/reports/?pending_only=true", {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt_token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        const formattedCases = data.reports?.map(report => ({
          ...report,
          id: report._id || report.id
        })) || [];
        setCases(formattedCases);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      setError(t("fetchError") + ": " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (caseId, status, comment = "") => {
    if (!caseId) {
      alert(t("fetchError") + ": Invalid case ID");
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/reports/cases/${caseId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, comment }),
      });
      
      if (response.ok) {
        await fetchCases();
        alert(t("statusUpdated"));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to update status: ${response.statusText}`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert(t("fetchError") + ": " + err.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          linear-gradient(135deg, ${alpha('#42a5f5', 0.05)} 0%, ${alpha('#42a5f5', 0)} 100%),
          linear-gradient(45deg, ${alpha('#1976d2', 0.02)} 0%, ${alpha('#1976d2', 0)} 100%)
        `,
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#1565c0',
            mb: 3,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: 60,
              height: 4,
              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
              borderRadius: 2,
            },
          }}
        >
          {t("pendingCases")}
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress sx={{ color: '#1976d2' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : cases.length > 0 ? (
          <List>
            {cases.map((caseItem) => (
              <MotionPaper
                key={caseItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                sx={{
                  mb: 2,
                  p: 3,
                  borderRadius: 3,
                  background: alpha('#fff', 0.8),
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: alpha('#1976d2', 0.1),
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="h6" sx={{ color: '#1565c0', mb: 1 }}>
                      {t("caseId")}: {caseItem.id}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>{t("description")}:</strong>{" "}
                        {caseItem.incident_details?.description || t("notAvailable")}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>{t("location")}:</strong>{" "}
                        {caseItem.incident_details?.location?.country || t("notSpecified")}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>{t("violationTypes")}:</strong>{" "}
                        {caseItem.incident_details?.violation_types?.join(", ") || t("notAvailable")}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        <strong>{t("date")}:</strong>{" "}
                        {new Date(caseItem.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={() => handleUpdateStatus(caseItem.id, "approved")}
                    sx={{
                      background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                      },
                    }}
                  >
                    {t("approve")}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleUpdateStatus(caseItem.id, "rejected", prompt(t("rejectComment")))}
                    sx={{
                      background: 'linear-gradient(45deg, #d32f2f 30%, #ef5350 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #c62828 30%, #d32f2f 90%)',
                      },
                    }}
                  >
                    {t("reject")}
                  </Button>
                </Stack>
              </MotionPaper>
            ))}
          </List>
        ) : (
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
              background: alpha('#fff', 0.8),
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              {t("noPendingCases")}
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

export default AdminReports;
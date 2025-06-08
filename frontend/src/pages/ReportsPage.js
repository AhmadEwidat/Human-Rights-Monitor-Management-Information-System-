import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItemText,
  Chip,
  Stack,
  alpha,
} from "@mui/material";
import { motion } from "framer-motion";

const MotionPaper = motion(Paper);

function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/reports/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt_token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      setError("Failed to fetch reports: " + err.message);
    } finally {
      setLoading(false);
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
            mb: 4,
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
          Reports
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress sx={{ color: '#1976d2' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : reports.length > 0 ? (
          <List>
            {reports.map((report, index) => (
              <MotionPaper
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
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
                      Incident Details
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {report.incident_details?.description || "Not available"}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        <Chip
                          label={report.status || "Unknown"}
                          size="small"
                          sx={{
                            backgroundColor: alpha('#1976d2', 0.1),
                            color: '#1976d2',
                            fontWeight: 500,
                          }}
                        />
                        <Chip
                          label={new Date(report.created_at).toLocaleDateString()}
                          size="small"
                          sx={{
                            backgroundColor: alpha('#1976d2', 0.1),
                            color: '#1976d2',
                            fontWeight: 500,
                          }}
                        />
                      </Stack>
                    </Box>
                  }
                />
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
              No reports available.
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

export default ReportsPage;

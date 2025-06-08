import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  createTheme,
  ThemeProvider,
  Chip,
  Divider,
  alpha,
  useMediaQuery,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import SearchIcon from "@mui/icons-material/Search";
import { motion } from "framer-motion";

const theme = createTheme();
const MotionCard = motion(Card);

function CasesList() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    violation_type: "",
  });
  const [sortBy, setSortBy] = useState("created_at");
  const [violationOptions, setViolationOptions] = useState([]);
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!role || role !== "institution") {
      navigate("/login");
      return;
    }
    fetchCases();
    fetchViolationTypes();
  }, [role, navigate]);

  const fetchCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/reports/cases", {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt_token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch cases.");
      const data = await response.json();
      const formattedCases = Array.isArray(data.cases)
        ? data.cases.map((c) => ({ ...c, id: c.id || c._id?.toString() }))
        : [];
      setCases(formattedCases);
      setFilteredCases(formattedCases);
    } catch (err) {
      setError("Error: " + err.message);
      if (err.message.includes("401")) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchViolationTypes = async () => {
    try {
      const response = await fetch("http://localhost:8000/case-types", {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt_token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        setViolationOptions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching violation types:", err);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    filterAndSortCases(query, filters, sortBy);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    filterAndSortCases(searchQuery, updatedFilters, sortBy);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    filterAndSortCases(searchQuery, filters, value);
  };

  const filterAndSortCases = (query, filters, sortBy) => {
    let filtered = cases;

    if (query) {
      filtered = filtered.filter((c) =>
        c.id.toLowerCase().includes(query) ||
        c.incident_details?.description?.toLowerCase().includes(query)
      );
    }

    if (filters.status) {
      filtered = filtered.filter((c) => c.status === filters.status);
    }

    if (filters.violation_type) {
      filtered = filtered.filter((c) =>
        c.incident_details?.violation_types?.includes(filters.violation_type)
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === "created_at") {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === "case_id") {
        return a.id.localeCompare(b.id);
      }
      return 0;
    });

    setFilteredCases(filtered);
  };

  const handleSelectCase = (id) => {
    navigate(`/institution-create-report/${id}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4">Available Cases</Typography>
            <Typography variant="subtitle1">
              Select a case to report a human rights violation.
            </Typography>
          </Box>

          <Paper sx={{ p: 2, mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search Cases"
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ mt: 2, minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="under_investigation">Under Investigation</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
          </Paper>

          {loading ? (
            <Box sx={{ textAlign: "center" }}>
              <CircularProgress />
              <Typography>Loading...</Typography>
            </Box>
          ) : error ? (
            <Alert severity="error" icon={<ErrorOutlineIcon />}>
              {error}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredCases.map((c) => (
                <Grid item xs={12} sm={6} md={4} key={c.id}>
                  <MotionCard>
                    <CardContent>
                      <Typography variant="h6">Case ID: {c.id}</Typography>
                      <Typography variant="body2">
                        {c.incident_details?.description || "No description"}
                      </Typography>
                      <Typography variant="body2">
                        {new Date(c.created_at).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        {c.incident_details?.location?.country || "Unknown location"}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button fullWidth variant="contained" onClick={() => handleSelectCase(c.id)}>
                        Add Report
                      </Button>
                    </CardActions>
                  </MotionCard>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default CasesList;

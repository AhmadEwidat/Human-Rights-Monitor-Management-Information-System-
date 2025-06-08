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
  IconButton,
  Tooltip,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import { motion } from "framer-motion";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#42a5f5",
      light: "#64b5f6",
      dark: "#1976d2",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f8f9fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#2c3e50",
      secondary: "#546e7a",
    },
    success: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
    },
    grey: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#eeeeee",
      300: "#e0e0e0",
      400: "#bdbdbd",
      500: "#9e9e9e",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: "-0.02em",
      color: "#1565c0",
    },
    h6: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
      color: "#1976d2",
    },
    button: {
      fontWeight: 600,
      letterSpacing: "0.02em",
    },
    subtitle1: {
      fontWeight: 500,
      letterSpacing: "0.01em",
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: "1px solid",
          borderColor: "rgba(0, 0, 0, 0.06)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
            opacity: 0,
            transition: "opacity 0.3s ease",
          },
          "&:hover::before": {
            opacity: 1,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 600,
          padding: "12px 24px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
            transform: "translateY(-2px)",
          },
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        contained: {
          background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
          "&:hover": {
            background: "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          height: 24,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "scale(1.1)",
            backgroundColor: alpha("#1976d2", 0.08),
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
});

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
  const [showFilters, setShowFilters] = useState(false);
  const role = localStorage.getItem("role");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "#1976d2";
      case "under_investigation":
        return "#f57c00";
      case "resolved":
        return "#2e7d32";
      default:
        return "#757575";
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        py: 4, 
        backgroundColor: theme.palette.background.default, 
        minHeight: "100vh",
        direction: "ltr",
        textAlign: "left"
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            mb: 4, 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            direction: "ltr"
          }}>
            <Box sx={{ textAlign: "left" }}>
              <Typography variant="h4" gutterBottom>
                Available Cases
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Select a case to report a human rights violation
              </Typography>
            </Box>
            <Tooltip title="Add New Case">
              <IconButton
                color="primary"
                onClick={() => navigate("/create-case")}
                sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}
              >
                <AddCircleOutlineIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.grey[200]}`,
              direction: "ltr"
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search cases by ID or description"
                  value={searchQuery}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                    direction: "ltr",
                    textAlign: "left"
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  display: "flex", 
                  gap: 2, 
                  justifyContent: "flex-end",
                  direction: "ltr"
                }}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    Filters
                  </Button>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={handleSortChange}
                      label="Sort By"
                      startAdornment={
                        <InputAdornment position="start">
                          <SortIcon />
                        </InputAdornment>
                      }
                      sx={{ direction: "ltr" }}
                    >
                      <MenuItem value="created_at">Date</MenuItem>
                      <MenuItem value="case_id">Case ID</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
            </Grid>

            {showFilters && (
              <Box sx={{ 
                mt: 2, 
                display: "flex", 
                gap: 2, 
                flexWrap: "wrap",
                direction: "ltr",
                justifyContent: "flex-start"
              }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    label="Status"
                    sx={{ direction: "ltr" }}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="under_investigation">Under Investigation</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Violation Type</InputLabel>
                  <Select
                    name="violation_type"
                    value={filters.violation_type}
                    onChange={handleFilterChange}
                    label="Violation Type"
                    sx={{ direction: "ltr" }}
                  >
                    <MenuItem value="">All</MenuItem>
                    {violationOptions.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </Paper>

          {loading ? (
            <Box sx={{ 
              textAlign: "center", 
              py: 8,
              direction: "ltr"
            }}>
              <CircularProgress size={40} />
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Loading cases...
              </Typography>
            </Box>
          ) : error ? (
            <Alert 
              severity="error" 
              icon={<ErrorOutlineIcon />}
              sx={{ 
                borderRadius: 2,
                direction: "ltr",
                "& .MuiAlert-icon": {
                  color: theme.palette.error.main
                }
              }}
            >
              {error}
            </Alert>
          ) : filteredCases.length === 0 ? (
            <Box sx={{ 
              textAlign: "center", 
              py: 8,
              direction: "ltr"
            }}>
              <FolderOpenIcon sx={{ fontSize: 60, color: theme.palette.grey[400] }} />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                No cases found
              </Typography>
              <Typography color="text.secondary">
                Try adjusting your search or filters
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredCases.map((c) => (
                <Grid item xs={12} sm={6} md={4} key={c.id}>
                  <MotionCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                    sx={{ direction: "ltr" }}
                  >
                    <CardContent>
                      <Box sx={{ 
                        mb: 2, 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        direction: "ltr"
                      }}>
                        <Typography variant="h6" noWrap>
                          Case #{c.id}
                        </Typography>
                        <Chip
                          label={c.status.replace("_", " ")}
                          size="small"
                          sx={{
                            backgroundColor: alpha(getStatusColor(c.status), 0.1),
                            color: getStatusColor(c.status),
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          direction: "ltr",
                          textAlign: "left"
                        }}
                      >
                        {c.incident_details?.description || "No description available"}
                      </Typography>
                      <Box sx={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        direction: "ltr"
                      }}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(c.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {c.incident_details?.location?.country || "Unknown location"}
                        </Typography>
                      </Box>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ p: 2, direction: "ltr" }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleSelectCase(c.id)}
                        startIcon={<AddCircleOutlineIcon />}
                      >
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

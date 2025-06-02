import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
  Fade,
  createTheme,
  ThemeProvider,
  Chip,
  Divider,
  alpha,
  useMediaQuery,
  IconButton,
  Tooltip,
  Badge,
  Avatar,
  Stack,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import { motion } from "framer-motion";

// Premium theme with sophisticated color palette
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
  const { t } = useTranslation();
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
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    const formattedCases = Array.isArray(data.cases)
      ? data.cases.map((c) => ({
          ...c,
          id: c.id || c._id?.toString(),
        }))
      : [];
    setCases(formattedCases);
    setFilteredCases(formattedCases);
  } catch (err) {
    setError(t("fetchError") + ": " + err.message);
    if (err.message.includes("401")) {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
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
    setFilters((prev) => ({ ...prev, [name]: value }));
    filterAndSortCases(searchQuery, { ...filters, [name]: value }, sortBy);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    filterAndSortCases(searchQuery, filters, value);
  };

  const filterAndSortCases = (query, filters, sortBy) => {
    let filtered = cases;

    // Apply search query
    if (query) {
      filtered = filtered.filter(
        (caseItem) =>
          caseItem.id?.toLowerCase().includes(query) ||
          caseItem.incident_details?.description?.toLowerCase().includes(query) ||
          caseItem.incident_details?.location?.country?.toLowerCase().includes(query) ||
          caseItem.incident_details?.violation_types?.join(" ").toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter((caseItem) => caseItem.status === filters.status);
    }
    if (filters.violation_type) {
      filtered = filtered.filter((caseItem) =>
        caseItem.incident_details?.violation_types?.includes(filters.violation_type)
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "created_at") {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === "case_id") {
        return a.id.localeCompare(b.id);
      } else if (sortBy === "location") {
        return (a.incident_details?.location?.country || "").localeCompare(
          b.incident_details?.location?.country || ""
        );
      }
      return 0;
    });

    setFilteredCases(filtered);
  };

  const handleSelectCase = (caseId) => {
    navigate(`/institution-create-report/${caseId}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100vh",
          py: 4,
          backgroundImage: `
            linear-gradient(135deg, ${alpha("#42a5f5", 0.05)} 0%, ${alpha("#42a5f5", 0)} 100%),
            linear-gradient(45deg, ${alpha("#1976d2", 0.02)} 0%, ${alpha("#1976d2", 0)} 100%)
          `,
        }}
      >
        <Container maxWidth="lg">
          {/* Header Section */}
          <Box
            sx={{
              mb: 5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexDirection: { xs: "column", sm: "row" },
              gap: 3,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  position: "relative",
                  mb: 1,
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: -8,
                    left: 0,
                    width: 60,
                    height: 4,
                    background: "linear-gradient(90deg, #2e7d32 0%, #66bb6a 100%)",
                    borderRadius: 2,
                  },
                }}
              >
                {t("availableCases")}
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ mt: 2, maxWidth: 600 }}
              >
                {t("selectCaseDescription")}
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <Tooltip title={t("notifications")}>
                <IconButton
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                  }}
                >
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => navigate("/institution-create-new-case")}
                sx={{
                  px: 3,
                  py: 1.5,
                  background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                }}
              >
                {t("createNewCase")}
              </Button>
            </Stack>
          </Box>

          {/* Search and Filter Section */}
          <Paper
            sx={{
              p: 2,
              mb: 4,
              borderRadius: 3,
              backgroundColor: alpha("#fff", 0.8),
              backdropFilter: "blur(10px)",
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              alignItems: { xs: "stretch", sm: "center" },
            }}
          >
            <TextField
              fullWidth
              placeholder={t("searchCases")}
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiInputBase-root": {
                  borderRadius: 2,
                  backgroundColor: "grey.50",
                },
              }}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>{t("status")}</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label={t("status")}
              >
                <MenuItem value="">{t("all")}</MenuItem>
                <MenuItem value="new">{t("new")}</MenuItem>
                <MenuItem value="under_investigation">{t("underInvestigation")}</MenuItem>
                <MenuItem value="resolved">{t("resolved")}</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>{t("violationType")}</InputLabel>
              <Select
                name="violation_type"
                value={filters.violation_type}
                onChange={handleFilterChange}
                label={t("violationType")}
              >
                <MenuItem value="">{t("all")}</MenuItem>
                {violationOptions.map((type) => (
                  <MenuItem key={type.name_en} value={type.name_en}>
                    {t(type.name_en) || type.name_en}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>{t("sortBy")}</InputLabel>
              <Select
                value={sortBy}
                onChange={handleSortChange}
                label={t("sortBy")}
              >
                <MenuItem value="created_at">{t("dateCreated")}</MenuItem>
                <MenuItem value="case_id">{t("caseId")}</MenuItem>
                <MenuItem value="location">{t("location")}</MenuItem>
              </Select>
            </FormControl>
          </Paper>

          {/* Cases List */}
          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 400,
                gap: 2,
              }}
            >
              <CircularProgress
                size={48}
                thickness={4}
                sx={{
                  color: "primary.main",
                  animation: "spin 1s linear infinite",
                  "@keyframes spin": {
                    "0%": {
                      transform: "rotate(0deg)",
                    },
                    "100%": {
                      transform: "rotate(360deg)",
                    },
                  },
                }}
              />
              <Typography variant="subtitle1" color="text.secondary">
                {t("loading")}
              </Typography>
            </Box>
          ) : error ? (
            <Alert
              severity="error"
              icon={<ErrorOutlineIcon />}
              sx={{
                mb: 2,
                borderRadius: 3,
                backgroundColor: alpha("#f44336", 0.05),
                border: "1px solid",
                borderColor: alpha("#f44336", 0.1),
                "& .MuiAlert-icon": {
                  color: "#d32f2f",
                },
              }}
            >
              {error}
            </Alert>
          ) : filteredCases.length > 0 ? (
            <Grid container spacing={3}>
              {filteredCases.map((caseItem, index) => (
                <Grid item xs={12} sm={6} md={4} key={caseItem.id}>
                  <MotionCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 16px 32px rgba(0, 0, 0, 0.1)",
                        borderColor: "primary.light",
                        "& .arrow-icon": {
                          transform: "translateX(4px)",
                        },
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box
                        sx={{
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: "primary.main",
                          }}
                        >
                          <FolderOpenIcon />
                        </Avatar>
                        <Typography variant="h6">
                          {t("caseId")}: {caseItem.id}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: 1.6,
                        }}
                      >
                        {caseItem.incident_details?.description || t("notAvailable")}
                      </Typography>
                      <Box
                        sx={{
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <AccessTimeIcon
                          sx={{ fontSize: 20, color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(caseItem.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {t("location")}:{" "}
                          {caseItem.incident_details?.location?.country || t("notSpecified")}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                        {caseItem.incident_details?.violation_types?.map((type, idx) => (
                          <Chip
                            key={idx}
                            label={t(type) || type}
                            size="small"
                            sx={{
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              color: "primary.dark",
                              fontWeight: 600,
                            }}
                          />
                        ))}
                      </Stack>
                      <Chip
                        label={t(caseItem.status) || caseItem.status}
                        size="small"
                        sx={{
                          backgroundColor:
                            caseItem.status === "new"
                              ? alpha(theme.palette.success.main, 0.1)
                              : caseItem.status === "under_investigation"
                              ? alpha(theme.palette.warning.main, 0.1)
                              : alpha(theme.palette.grey[500], 0.1),
                          color:
                            caseItem.status === "new"
                              ? "success.dark"
                              : caseItem.status === "under_investigation"
                              ? "warning.dark"
                              : "grey.800",
                          fontWeight: 600,
                        }}
                      />
                    </CardContent>
                    <CardActions sx={{ p: 3, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        endIcon={<ArrowForwardIcon className="arrow-icon" />}
                        onClick={() => handleSelectCase(caseItem.id)}
                        sx={{
                          background: "linear-gradient(45deg, #66bb6a 30%, #81c784 90%)",
                          "&:hover": {
                            background: "linear-gradient(45deg, #43a047 30%, #66bb6a 90%)",
                          },
                          "& .arrow-icon": {
                            transition: "transform 0.3s ease",
                          },
                        }}
                      >
                        {t("addReport")}
                      </Button>
                    </CardActions>
                  </MotionCard>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper
              sx={{
                p: 5,
                textAlign: "center",
                borderRadius: 3,
                backgroundColor: alpha("#fff", 0.8),
                backdropFilter: "blur(10px)",
                border: "1px dashed",
                borderColor: alpha(theme.palette.primary.main, 0.2),
                maxWidth: 600,
                mx: "auto",
              }}
            >
              <FolderOpenIcon
                sx={{
                  fontSize: 64,
                  color: "primary.light",
                  mb: 3,
                  opacity: 0.8,
                }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t("noCases")}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
              >
                {t("noActiveCasesDescription")}
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => navigate("/institution-create-new-case")}
                sx={{
                  borderWidth: 2,
                  "&:hover": {
                    borderWidth: 2,
                  },
                }}
              >
                {t("createFirstCase")}
              </Button>
            </Paper>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default CasesList;
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Stack,
  useTheme,
  alpha,
  IconButton,
  Avatar,
  Divider,
  LinearProgress,
  Badge,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  Notifications as NotificationsIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  CalendarToday as CalendarTodayIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const MotionPaper = motion(Paper);

export default function InstitutionWelcome() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all cases
      const response = await fetch('http://localhost:8000/reports/cases', {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      const cases = data.cases || [];

      // Calculate statistics
      const totalCases = cases.length;
      const activeReports = cases.filter(c => c.status === 'under_investigation').length;
      const pendingReviews = cases.filter(c => c.pending_approval).length;

      // Format stats
      setStats([
        {
          title: t('totalCases'),
          value: totalCases.toString(),
          icon: <DescriptionIcon />,
          color: theme.palette.primary.main,
          trend: '+12%', // This could be calculated based on historical data
        },
        {
          title: t('activeReports'),
          value: activeReports.toString(),
          icon: <AssessmentIcon />,
          color: theme.palette.success.main,
          trend: '+8%',
        },
        {
          title: t('pendingReviews'),
          value: pendingReviews.toString(),
          icon: <CheckCircleIcon />,
          color: theme.palette.warning.main,
          trend: '-3%',
        },
      ]);

      // Format recent activities
      const recentCases = cases
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3);

      setRecentActivities(
        recentCases.map(caseItem => ({
          title: caseItem.incident_details?.description || t('newCaseReported'),
          time: formatTimeAgo(new Date(caseItem.created_at)),
          icon: <DescriptionIcon />,
          status: caseItem.status,
        }))
      );
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return t('justNow');
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} ${t('minutesAgo')}`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ${t('hoursAgo')}`;
    return `${Math.floor(diffInSeconds / 86400)} ${t('daysAgo')}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{t('errorLoadingDashboard')}: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0)} 100%),
          linear-gradient(45deg, ${alpha(theme.palette.primary.dark, 0.02)} 0%, ${alpha(theme.palette.primary.dark, 0)} 100%)
        `,
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box
          sx={{
            mb: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: theme.palette.primary.dark,
                mb: 1,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 60,
                  height: 4,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                  borderRadius: 2,
                },
              }}
            >
              {t('welcomeInstitution')}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {t('welcomeDescription')}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <IconButton
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              <Badge badgeContent={stats[2]?.value || 0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/cases-list')}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                },
              }}
            >
              {t('viewAllCases')}
            </Button>
          </Stack>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <MotionPaper
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: alpha('#fff', 0.8),
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.1),
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(stat.color, 0.1),
                      color: stat.color,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: stat.trend.startsWith('+') ? 'success.main' : 'error.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 16 }} />
                  {stat.trend}
                </Typography>
              </MotionPaper>
            </Grid>
          ))}
        </Grid>

        {/* Recent Activities */}
        <MotionPaper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          sx={{
            p: 3,
            borderRadius: 3,
            background: alpha('#fff', 0.8),
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.1),
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            {t('recentActivities')}
          </Typography>
          <Stack spacing={2}>
            {recentActivities.map((activity, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    mr: 2,
                  }}
                >
                  {activity.icon}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {activity.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activity.time}
                  </Typography>
                </Box>
                <Chip
                  label={t(activity.status)}
                  size="small"
                  sx={{
                    backgroundColor: alpha(
                      activity.status === 'approved'
                        ? theme.palette.success.main
                        : activity.status === 'rejected'
                        ? theme.palette.error.main
                        : theme.palette.warning.main,
                      0.1
                    ),
                    color:
                      activity.status === 'approved'
                        ? 'success.main'
                        : activity.status === 'rejected'
                        ? 'error.main'
                        : 'warning.main',
                  }}
                />
              </Box>
            ))}
          </Stack>
        </MotionPaper>
      </Container>
    </Box>
  );
}

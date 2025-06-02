import React from 'react';
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

  const stats = [
    {
      title: t('totalCases'),
      value: '24',
      icon: <DescriptionIcon />,
      color: theme.palette.primary.main,
      trend: '+12%',
    },
    {
      title: t('activeReports'),
      value: '18',
      icon: <AssessmentIcon />,
      color: theme.palette.success.main,
      trend: '+8%',
    },
    {
      title: t('pendingReviews'),
      value: '6',
      icon: <CheckCircleIcon />,
      color: theme.palette.warning.main,
      trend: '-3%',
    },
  ];

  const recentActivities = [
    {
      title: t('newCaseReported'),
      time: '2 hours ago',
      icon: <DescriptionIcon />,
    },
    {
      title: t('reportUpdated'),
      time: '4 hours ago',
      icon: <AssessmentIcon />,
    },
    {
      title: t('caseResolved'),
      time: '1 day ago',
      icon: <CheckCircleIcon />,
    },
  ];

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
              <Badge badgeContent={3} color="error">
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
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon
                    sx={{
                      color: stat.trend.startsWith('+') ? 'success.main' : 'error.main',
                      mr: 1,
                    }}
                  />
                  <Typography
                    variant="body2"
                    color={stat.trend.startsWith('+') ? 'success.main' : 'error.main'}
                    sx={{ fontWeight: 600 }}
                  >
                    {stat.trend}
                  </Typography>
                </Box>
              </MotionPaper>
            </Grid>
          ))}
        </Grid>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <MotionPaper
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              sx={{
                p: 3,
                borderRadius: 3,
                background: alpha('#fff', 0.8),
                backdropFilter: 'blur(10px)',
                height: '100%',
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                {t('recentActivity')}
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
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {activity.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </MotionPaper>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <MotionPaper
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              sx={{
                p: 3,
                borderRadius: 3,
                background: alpha('#fff', 0.8),
                backdropFilter: 'blur(10px)',
                height: '100%',
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                {t('quickActions')}
              </Typography>
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<DescriptionIcon />}
                  onClick={() => navigate('/institution-create-new-case')}
                  sx={{
                    py: 1.5,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                    },
                  }}
                >
                  {t('createNewCase')}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  onClick={() => navigate('/cases-list')}
                  sx={{
                    py: 1.5,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                    },
                  }}
                >
                  {t('viewReports')}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PeopleIcon />}
                  onClick={() => navigate('/institution-profile')}
                  sx={{
                    py: 1.5,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                    },
                  }}
                >
                  {t('manageProfile')}
                </Button>
              </Stack>
            </MotionPaper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

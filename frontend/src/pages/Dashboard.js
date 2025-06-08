import React from 'react';
import { motion } from 'framer-motion'; // ✅ أضف هذا السطر أولاً

import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stack,
  alpha,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';

const MotionPaper = motion(Paper); // أو motion.create(Paper) لو كنت متأكد أنك تستخدم v11+

const MotionCard = motion(Card);

const Dashboard = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Cases',
      description: 'Browse and manage all cases',
      icon: <DescriptionIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      action: () => navigate('/cases-list'),
    },
    {
      title: 'Report',
      description: 'Submit a new case report',
      icon: <AssessmentIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      action: () => navigate('/submit-report'),
    },
    {
      title: 'Users',
      description: 'View and manage system users',
      icon: <PeopleIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      action: () => navigate('/users'),
    },
  ];

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
          Dashboard
        </Typography>

        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  background: alpha('#fff', 0.8),
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: alpha('#1976d2', 0.1),
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {action.icon}
                    <Typography variant="h6" sx={{ ml: 2, color: '#1565c0' }}>
                      {action.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={action.action}
                    sx={{
                      background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                      },
                    }}
                  >
                    Go to {action.title}
                  </Button>
                </CardActions>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;

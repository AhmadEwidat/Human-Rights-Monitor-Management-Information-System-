import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  Stack,
  alpha,
  CircularProgress,
  Alert,
  TextField,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import BusinessIcon from '@mui/icons-material/Business';

const MotionPaper = motion(Paper);

const InstitutionProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    institution_name: '',
    username: '',
    active: true,
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('Authentication token not found. Please log in again.');

      const response = await fetch('http://localhost:8000/institution/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) throw new Error('Your session has expired. Please log in again.');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch profile data');
      }

      const data = await response.json();
      setProfileData({
        institution_name: data.institution_name?.en || '',
        username: data.username || '',
        active: data.active,
      });

      if (!data.institution_name?.en) {
        setSuccessMessage('Welcome! Please complete your profile information.');
      }
    } catch (err) {
      setError(err.message);
      if (err.message.includes('session has expired') || err.message.includes('token not found')) {
        setTimeout(() => {
          localStorage.removeItem('jwt_token');
          window.location.href = '/login';
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    fetchProfileData();
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('Authentication token not found. Please log in again.');

      const response = await fetch('http://localhost:8000/institution/profile/update/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          institution_name: { en: profileData.institution_name },
          username: profileData.username,
          active: profileData.active,
        }),
      });

      if (response.status === 401) throw new Error('Your session has expired. Please log in again.');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update profile');
      }

      const updatedData = await response.json();
      setProfileData({
        institution_name: updatedData.institution_name?.en || '',
        username: updatedData.username || '',
        active: updatedData.active,
      });
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setError(null);
    } catch (err) {
      setError(err.message);
      if (err.message.includes('session has expired') || err.message.includes('token not found')) {
        setTimeout(() => {
          localStorage.removeItem('jwt_token');
          window.location.href = '/login';
        }, 2000);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#1976d2' }} />
      </Box>
    );
  }

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
          Institution Profile
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 3 }}>{successMessage}</Alert>}

        <MotionPaper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          sx={{
            p: 4,
            borderRadius: 3,
            background: alpha('#fff', 0.8),
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: alpha('#1976d2', 0.1),
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    border: '4px solid',
                    borderColor: alpha('#1976d2', 0.2),
                    bgcolor: '#1976d2',
                  }}
                >
                  <BusinessIcon sx={{ fontSize: 60 }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ color: '#1565c0', fontWeight: 600 }}>
                    {profileData.institution_name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {profileData.username}
                  </Typography>
                </Box>
                {!isEditing ? (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    sx={{
                      background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                      },
                    }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      sx={{
                        background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                        },
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      sx={{
                        borderColor: '#1976d2',
                        color: '#1976d2',
                        '&:hover': {
                          borderColor: '#1565c0',
                          backgroundColor: alpha('#1976d2', 0.04),
                        },
                      }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={3}>
                <TextField
                  label="Institution Name"
                  value={profileData.institution_name}
                  onChange={(e) => handleInputChange('institution_name', e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                />
              </Stack>
            </Grid>
          </Grid>
        </MotionPaper>
      </Container>
    </Box>
  );
};

export default InstitutionProfile;

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
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import BusinessIcon from '@mui/icons-material/Business';

const MotionPaper = motion(Paper);

const InstitutionProfile = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language === 'en-US' ? 'en' : i18n.language);
  const [profileData, setProfileData] = useState({
    institution_name: {
      ar: '',
      en: ''
    },
    username: '',
    active: true
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    setCurrentLang(i18n.language === 'en-US' ? 'en' : i18n.language);
  }, [i18n.language]);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        console.error('No JWT token found in localStorage');
        throw new Error('Authentication token not found. Please log in again.');
      }

      console.log('Fetching profile data with token:', token.substring(0, 20) + '...');
      
      const response = await fetch('http://localhost:8000/institution/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Profile response status:', response.status);
      
      if (response.status === 401) {
        console.error('Authentication failed - token may be invalid or expired');
        throw new Error('Your session has expired. Please log in again.');
      } else if (!response.ok) {
        const errorData = await response.json();
        console.error('Profile fetch error:', errorData);
        throw new Error(errorData.detail || 'Failed to fetch profile data');
      }

      const data = await response.json();
      console.log('Profile data received:', data);
      setProfileData(data);
      
      // Check if this is a new profile (all fields are empty)
      const isEmptyProfile = Object.values(data.institution_name).every(value => !value);
      if (isEmptyProfile) {
        setSuccessMessage('Welcome! Please complete your profile information.');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfileData(); // Reset to original data
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        console.error('No JWT token found in localStorage');
        throw new Error('Authentication token not found. Please log in again.');
      }

      console.log('Updating profile with token:', token.substring(0, 20) + '...');
      
      const response = await fetch('http://localhost:8000/institution/profile/update/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      console.log('Update response status:', response.status);
      
      if (response.status === 401) {
        console.error('Authentication failed during update - token may be invalid or expired');
        throw new Error('Your session has expired. Please log in again.');
      } else if (!response.ok) {
        const errorData = await response.json();
        console.error('Profile update error:', errorData);
        throw new Error(errorData.detail || 'Failed to update profile');
      }

      const updatedData = await response.json();
      console.log('Profile updated successfully:', updatedData);
      setProfileData(updatedData);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setError(null);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message);
      if (err.message.includes('session has expired') || err.message.includes('token not found')) {
        setTimeout(() => {
          localStorage.removeItem('jwt_token');
          window.location.href = '/login';
        }, 2000);
      }
    }
  };

  const handleInputChange = (field, lang, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value
      }
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
          {t('institutionProfile')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

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
            {/* Profile Header */}
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
                    {profileData.institution_name[currentLang]}
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
                    {t('editProfile')}
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
                      {t('save')}
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
                      {t('cancel')}
                    </Button>
                  </Stack>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Tabs
                value={currentLang}
                onChange={(e, newValue) => setCurrentLang(newValue)}
                sx={{ mb: 3 }}
              >
                <Tab value="en" label="English" />
                <Tab value="ar" label="العربية" />
              </Tabs>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={3}>
                <TextField
                  label={t('institutionName')}
                  value={profileData.institution_name[currentLang]}
                  onChange={(e) => handleInputChange('institution_name', currentLang, e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                  InputProps={{
                    startAdornment: <BusinessIcon sx={{ color: '#1976d2', mr: 1 }} />,
                  }}
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
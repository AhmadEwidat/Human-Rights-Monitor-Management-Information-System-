import React from "react";
import { Box, Container, Typography, Paper, Button, Stack, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

const InvestigatorWelcome = () => {
  const navigate = useNavigate();

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
                color: '#1565c0',
                mb: 1,
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
              Welcome Investigator
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Review and investigate reported cases
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={() => navigate('/investigator/cases')}
              sx={{
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                },
              }}
            >
              View Cases
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/investigator/reports')}
              sx={{
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                },
              }}
            >
              My Reports
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default InvestigatorWelcome;

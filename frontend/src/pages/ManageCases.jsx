import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stack,
  alpha,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import { motion } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const MotionPaper = motion(Paper);

// ✅ Centralized static text (optional)
const TEXT = {
  pageTitle: 'Manage Cases',
  createButton: 'Create New Case',
  filters: {
    region: 'Filter by region',
    status: 'Filter by status',
    violation: 'Filter by violation',
  },
  tableHeaders: ['Case ID', 'Title', 'Status', 'Priority', 'Date Reported', 'Actions'],
  emptyMessage: 'No cases found.',
  tooltips: {
    view: 'View Details',
    edit: 'Edit Case',
    archive: 'Archive Case',
  },
  confirmations: {
    archive: 'Are you sure you want to archive this case?',
    unarchive: 'Do you want to unarchive this case?',
  },
};

const ManageCases = () => {
  const [cases, setCases] = useState([]);
  const [filter, setFilter] = useState({ status: '', region: '', violation_type: '' });
  const navigate = useNavigate();

  const fetchCases = async () => {
    try {
      const response = await axios.get('http://localhost:8000/cases/', {
        params: filter
      });
      setCases(response.data);
    } catch (error) {
      console.error('Error fetching cases:', error);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [filter]);

  const toggleArchive = async (id, currentStatus) => {
    const isArchived = currentStatus === "archived";
    const confirmText = isArchived
      ? TEXT.confirmations.unarchive
      : TEXT.confirmations.archive;

    if (!window.confirm(confirmText)) return;

    try {
      const newStatus = isArchived ? "new" : "archived";
      await axios.patch(`http://localhost:8000/cases/${id}`, { status: newStatus });
      fetchCases();
    } catch (error) {
      console.error("Error toggling archive status:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(TEXT.confirmations.archive)) return;
    try {
      await axios.delete(`http://localhost:8000/cases/${id}`);
      fetchCases();
    } catch (error) {
      console.error("Error archiving case:", error);
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
            {TEXT.pageTitle}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/cases/create')}
            sx={{
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
              },
            }}
          >
            {TEXT.createButton}
          </Button>
        </Box>

        <MotionPaper
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: alpha('#fff', 0.8),
            backdropFilter: 'blur(10px)',
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label={TEXT.filters.region}
              value={filter.region}
              onChange={(e) => setFilter({ ...filter, region: e.target.value })}
              size="small"
            />
            <TextField
              fullWidth
              label={TEXT.filters.status}
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              size="small"
            />
            <TextField
              fullWidth
              label={TEXT.filters.violation}
              value={filter.violation_type}
              onChange={(e) => setFilter({ ...filter, violation_type: e.target.value })}
              size="small"
            />
          </Stack>
        </MotionPaper>

        <TableContainer
          component={MotionPaper}
          sx={{
            borderRadius: 3,
            background: alpha('#fff', 0.8),
            backdropFilter: 'blur(10px)',
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                {TEXT.tableHeaders.map((header) => (
                  <TableCell key={header}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {cases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">{TEXT.emptyMessage}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                cases.map((c) => (
                  <TableRow key={c.case_id}>
                    <TableCell>{c.case_id}</TableCell>
                    <TableCell>{c.title?.en}</TableCell>
                    <TableCell>{c.status}</TableCell>
                    <TableCell>{c.priority}</TableCell>
                    <TableCell>{new Date(c.date_reported).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title={TEXT.tooltips.view}>
                          <IconButton onClick={() => navigate(`/cases/${c._id}`)} sx={{ color: '#1976d2' }}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={TEXT.tooltips.edit}>
                          <IconButton onClick={() => navigate(`/cases/${c._id}/update`)} sx={{ color: '#1976d2' }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={TEXT.tooltips.archive}>
                          <IconButton onClick={() => handleDelete(c._id)} sx={{ color: '#d32f2f' }}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default ManageCases;

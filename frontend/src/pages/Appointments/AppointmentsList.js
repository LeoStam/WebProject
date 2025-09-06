// src/pages/Appointments/AppointmentsList.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Typography,
  Chip,
  TextField,
  Grid,
  Card,
  CardContent,
  MenuItem,
  InputAdornment,
  Collapse,
  styled
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api.service';
import AppointmentDialog from './AppointmentDialog';
import AppointmentDetailsDialog from './AppointmentDetailsDialog';

const Header = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3)
}));

const StyledTable = styled(Table)({
  minWidth: 650,
});

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    created: theme.palette.info.light,
    in_progress: theme.palette.warning.light,
    completed: theme.palette.success.light,
    cancelled: theme.palette.error.light
  };
  
  return {
    margin: theme.spacing(0.5),
    backgroundColor: colors[status]
  };
});

const AppointmentsList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedAppointmentForDetails, setSelectedAppointmentForDetails] = useState(null);

  // Search and filter state
  const [searchFilters, setSearchFilters] = useState({
  search_text: '',
  status: '',
  start_date: '',
  end_date: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [mechanics, setMechanics] = useState([]);

  const fetchAppointments = async (filters = {}) => {
    try {
  const hasFilters = Object.values(filters).some(value => value !== '');
  const endpoint = hasFilters ? '/appointments/search' : '/appointments';
  // Only send relevant filters to backend
  const params = {};
  if (filters.status) params.status = filters.status;
  if (filters.start_date) params.start_date = filters.start_date;
  if (filters.end_date) params.end_date = filters.end_date;
  if (filters.search_text) params.search_text = filters.search_text;
  const response = await api.get(endpoint, { params });
  setAppointments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      enqueueSnackbar('Failed to fetch appointments', { variant: 'error' });
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersForFilters = async () => {
    if (user?.role === 'secretary') {
      try {
        const [customersRes, mechanicsRes] = await Promise.all([
          api.get('/users?role=customer'),
          api.get('/users?role=mechanic')
        ]);
        setCustomers(customersRes.data.data || []);
        setMechanics(mechanicsRes.data.data || []);
      } catch (error) {
        console.error('Error fetching users for filters:', error);
      }
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((filters) => {
      fetchAppointments(filters);
    }, 500),
    []
  );

  const handleFilterChange = (field, value) => {
    const newFilters = { ...searchFilters, [field]: value };
    setSearchFilters(newFilters);
    
    // For text search, use debounced search; for dropdowns, search immediately
    if (field === 'search_text') {
      debouncedSearch(newFilters);
    } else {
      fetchAppointments(newFilters);
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      search_text: '',
      status: '',
      start_date: '',
      end_date: ''
    };
    setSearchFilters(clearedFilters);
    fetchAppointments();
  };

  // Simple debounce utility
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  useEffect(() => {
    fetchAppointments();
    fetchUsersForFilters();
  }, []);

  const handleAdd = () => {
    setSelectedAppointment(null);
    setDialogOpen(true);
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setDialogOpen(true);
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointmentForDetails(appointment);
    setDetailsDialogOpen(true);
  };

  const handleCancel = async (appointment) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.patch(`/appointments/${appointment.id}/cancel`);
        enqueueSnackbar('Appointment cancelled successfully', { variant: 'success' });
        fetchAppointments();
      } catch (error) {
        enqueueSnackbar('Failed to cancel appointment', { variant: 'error' });
      }
    }
  };

  const handleStartWork = async (appointment) => {
    try {
      await api.patch(`/appointments/${appointment.id}/start`);
      enqueueSnackbar('Work started successfully', { variant: 'success' });
      fetchAppointments();
    } catch (error) {
      console.error('Error starting work:', error);
      const message = error.response?.data?.message || 'Failed to start work';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleCompleteWork = async (appointment) => {
    if (window.confirm('Mark this appointment as completed?')) {
      try {
        await api.put(`/appointments/${appointment.id}`, { 
          ...appointment, 
          status: 'completed' 
        });
        enqueueSnackbar('Appointment completed successfully', { variant: 'success' });
        fetchAppointments();
      } catch (error) {
        enqueueSnackbar('Failed to complete appointment', { variant: 'error' });
      }
    }
  };

  const getStatusChip = (status) => {
    const statusMap = {
      created: 'Created',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };

    return (
      <StatusChip
        label={statusMap[status] || statusMap.created}
        status={status}
      />
    );
  };

  const canEdit = (appointment) => {
    if (user.role === 'secretary') return true;
    
    if (user.role === 'mechanic') {
      // Mechanics can only edit appointments they are assigned to and that are in progress
      return appointment.status === 'in_progress' && 
             appointment.mechanic_id === user.id;
    }
    
    if (user.role === 'customer') {
      // Customers can only edit their own appointments that are still 'created'
      return appointment.status === 'created' && 
             appointment.customer_id === user.id;
    }
    
    return false;
  };

  const canCancel = (appointment) => {
    // Only customers and secretaries can cancel appointments
    if (user.role === 'mechanic') return false;
    
    if (user.role === 'customer') {
      // Customers can only cancel their own appointments that are still 'created'
      return appointment.status === 'created' && appointment.customer_id === user.id;
    }
    
    if (user.role === 'secretary') {
      // Secretaries can cancel any appointment that's not completed
      return appointment.status !== 'completed';
    }
    
    return false;
  };

  if (loading) {
    return <Typography>Loading appointments...</Typography>;
  }

  return (
    <>
      <Header>
        <Typography variant="h5">Appointments</Typography>
        {(user?.role === 'customer' || user?.role === 'secretary') && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            New Appointment
          </Button>
        )}
      </Header>

        {/* Search & Filter UI */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Search by Full Name or AFM"
                  value={searchFilters.search_text}
                  onChange={e => handleFilterChange('search_text', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={searchFilters.status}
                  onChange={e => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="created">Created</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  type="date"
                  fullWidth
                  label="Start Date"
                  InputLabelProps={{ shrink: true }}
                  value={searchFilters.start_date}
                  onChange={e => handleFilterChange('start_date', e.target.value)}
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  type="date"
                  fullWidth
                  label="End Date"
                  InputLabelProps={{ shrink: true }}
                  value={searchFilters.end_date}
                  onChange={e => handleFilterChange('end_date', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={1}>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  fullWidth
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

      <TableContainer component={Paper}>
        <StyledTable>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Car</TableCell>
              <TableCell>Mechanic</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No appointments found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    {format(new Date(appointment.date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{appointment.start_time}</TableCell>
                  <TableCell>{appointment.appointmentCustomer?.full_name || 'N/A'}</TableCell>
                  <TableCell>
                    {`${appointment.car?.brand || ''} ${appointment.car?.model || ''}`.trim() || 'N/A'}
                  </TableCell>
                  <TableCell>{appointment.appointmentMechanic?.full_name || 'Not assigned'}</TableCell>
                  <TableCell>{appointment.reason}</TableCell>
                  <TableCell>{getStatusChip(appointment.status)}</TableCell>
                  <TableCell>
                    {/* View Details button - always available */}
                    <IconButton 
                      onClick={() => handleViewDetails(appointment)}
                      color="info"
                      title="View Details"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    
                    {/* Standard edit button */}
                    {canEdit(appointment) && (
                      <IconButton 
                        onClick={() => handleEdit(appointment)}
                        title="Edit Appointment"
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    
                    {/* Mechanic status controls - only for assigned appointments */}
                    {user?.role === 'mechanic' && 
                     appointment.mechanic_id === user.id && 
                     appointment.status === 'created' && (
                      <IconButton 
                        onClick={() => handleStartWork(appointment)}
                        color="primary"
                        title="Start Work"
                      >
                        <PlayArrowIcon />
                      </IconButton>
                    )}
                    
                    {user?.role === 'mechanic' && 
                     appointment.mechanic_id === user.id && 
                     appointment.status === 'in_progress' && (
                      <IconButton 
                        onClick={() => handleCompleteWork(appointment)}
                        color="success"
                        title="Complete Work"
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    )}
                    
                    {/* Cancel button */}
                    {canCancel(appointment) && (
                      <IconButton 
                        onClick={() => handleCancel(appointment)}
                        color="error"
                        title="Cancel Appointment"
                      >
                        <CancelIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </StyledTable>
      </TableContainer>

            <AppointmentDialog
        open={dialogOpen}
        onClose={(refreshList) => {
          setDialogOpen(false);
          if (refreshList) fetchAppointments();
        }}
        appointment={selectedAppointment}
      />

      <AppointmentDetailsDialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedAppointmentForDetails(null);
          fetchAppointments(); // Refresh list in case tasks were updated
        }}
        appointment={selectedAppointmentForDetails}
      />
    </>
  );
};

export default AppointmentsList;

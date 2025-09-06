import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Chip,
  Box,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api.service';

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const Label = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.secondary,
}));

const getStatusColor = (status) => {
  switch (status) {
    case 'created':
      return 'default';
    case 'in_progress':
      return 'warning';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'created':
      return 'Created';
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

const AppointmentDetailsDialog = ({ open, onClose, appointment }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch tasks when appointment changes
  useEffect(() => {
    if (appointment && appointment.id && (appointment.status === 'in_progress' || appointment.status === 'completed')) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [appointment?.id, appointment?.status]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/tasks?appointmentId=${appointment.id}`);
      setTasks(response.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCost = () => {
    return tasks.reduce((total, task) => total + (parseFloat(task.cost) || 0), 0);
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <StyledDialogTitle>
        Appointment Details
      </StyledDialogTitle>
      
      <DialogContent sx={{ pb: 0 }}>
        <Grid container spacing={3}>
          {/* Left Column - Basic Info */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            
            <InfoRow>
              <Label>Date:</Label>
              <Typography>
                {new Date(appointment.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            </InfoRow>
            
            <InfoRow>
              <Label>Time:</Label>
              <Typography>{appointment.start_time}</Typography>
            </InfoRow>
            
            <InfoRow>
              <Label>Status:</Label>
              <Chip 
                label={getStatusLabel(appointment.status)}
                color={getStatusColor(appointment.status)}
                size="small"
              />
            </InfoRow>
            
            <InfoRow>
              <Label>Reason:</Label>
              <Typography sx={{ textTransform: 'capitalize' }}>
                {appointment.reason}
              </Typography>
            </InfoRow>

            {appointment.problem_description && (
              <>
                <Label sx={{ mt: 2, mb: 1 }}>Problem Description:</Label>
                <Typography variant="body2" sx={{ 
                  backgroundColor: 'grey.100',
                  p: 1,
                  borderRadius: 1,
                  fontStyle: 'italic'
                }}>
                  {appointment.problem_description}
                </Typography>
              </>
            )}
          </Grid>

          {/* Right Column - People & Car Info */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
            
            {appointment.appointmentCustomer && (
              <>
                <InfoRow>
                  <Label>Customer:</Label>
                  <Typography>
                    {appointment.appointmentCustomer.full_name}
                  </Typography>
                </InfoRow>
                <InfoRow>
                  <Label>Email:</Label>
                  <Typography variant="body2" color="text.secondary">
                    {appointment.appointmentCustomer.email}
                  </Typography>
                </InfoRow>
              </>
            )}

            {appointment.appointmentMechanic && (
              <>
                <InfoRow sx={{ mt: 2 }}>
                  <Label>Assigned Mechanic:</Label>
                  <Typography>
                    {appointment.appointmentMechanic.full_name}
                  </Typography>
                </InfoRow>
              </>
            )}

            {appointment.car && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Vehicle Information
                </Typography>
                <InfoRow>
                  <Label>Vehicle:</Label>
                  <Typography>
                    {appointment.car.brand} {appointment.car.model}
                  </Typography>
                </InfoRow>
                <InfoRow>
                  <Label>VIN:</Label>
                  <Typography variant="body2" color="text.secondary">
                    {appointment.car.vin}
                  </Typography>
                </InfoRow>
                {appointment.car.plate_number && (
                  <InfoRow>
                    <Label>License Plate:</Label>
                    <Typography>
                      {appointment.car.plate_number}
                    </Typography>
                  </InfoRow>
                )}
              </>
            )}
          </Grid>
        </Grid>

        {/* Tasks & Services Summary - Only show for in_progress or completed appointments */}
        {(appointment.status === 'in_progress' || appointment.status === 'completed') && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Tasks & Services
            </Typography>
            
            {loading ? (
              <Typography variant="body2" color="text.secondary">
                Loading tasks...
              </Typography>
            ) : tasks.length > 0 ? (
              <>
                <InfoRow>
                  <Label>Number of Tasks:</Label>
                  <Typography>{tasks.length}</Typography>
                </InfoRow>
                
                <InfoRow>
                  <Label>Total Cost:</Label>
                  <Typography variant="h6" color="primary">
                    €{calculateTotalCost().toFixed(2)}
                  </Typography>
                </InfoRow>

                <Box sx={{ mt: 2 }}>
                  <Label sx={{ mb: 1 }}>Tasks:</Label>
                  {tasks.map((task, index) => (
                    <Box key={task.id} sx={{ mb: 1, pl: 2 }}>
                      <Typography variant="body2">
                        {index + 1}. {task.description} - €{parseFloat(task.cost || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No tasks have been added to this appointment yet.
              </Typography>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentDetailsDialog;

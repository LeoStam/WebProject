// src/pages/Appointments/AppointmentsList.js
import React, { useState, useEffect } from 'react';
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
  styled
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api.service';
import AppointmentDialog from './AppointmentDialog';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch appointments', { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAdd = () => {
    setSelectedAppointment(null);
    setDialogOpen(true);
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setDialogOpen(true);
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
    if (user.role === 'mechanic' && appointment.status === 'in_progress') return true;
    if (user.role === 'customer' && appointment.status === 'created') return true;
    return false;
  };

  const canCancel = (appointment) => {
    return appointment.status === 'created' || 
           (user.role === 'secretary' && appointment.status !== 'completed');
  };

  return (
    <>
      <Header>
        <Typography variant="h5">Appointments</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          New Appointment
        </Button>
      </Header>

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
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  {format(new Date(appointment.date), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>{appointment.start_time}</TableCell>
                <TableCell>{appointment.customer.full_name}</TableCell>
                <TableCell>
                  {`${appointment.car.brand} ${appointment.car.model}`}
                </TableCell>
                <TableCell>{appointment.mechanic.full_name}</TableCell>
                <TableCell>{appointment.reason}</TableCell>
                <TableCell>{getStatusChip(appointment.status)}</TableCell>
                <TableCell>
                  {canEdit(appointment) && (
                    <IconButton onClick={() => handleEdit(appointment)}>
                      <EditIcon />
                    </IconButton>
                  )}
                  {canCancel(appointment) && (
                    <IconButton onClick={() => handleCancel(appointment)}>
                      <CancelIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
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
    </>
  );
};

export default AppointmentsList;
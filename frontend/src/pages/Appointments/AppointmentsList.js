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
  makeStyles
} from '@material-ui/core';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Cancel as CancelIcon
} from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api.service';
import AppointmentDialog from './AppointmentDialog';

const useStyles = makeStyles((theme) => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3)
  },
  table: {
    minWidth: 650,
  },
  statusChip: {
    margin: theme.spacing(0.5),
  },
  created: {
    backgroundColor: theme.palette.info.light,
  },
  inProgress: {
    backgroundColor: theme.palette.warning.light,
  },
  completed: {
    backgroundColor: theme.palette.success.light,
  },
  cancelled: {
    backgroundColor: theme.palette.error.light,
  }
}));

const AppointmentsList = () => {
  const classes = useStyles();
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
      created: { label: 'Created', className: classes.created },
      in_progress: { label: 'In Progress', className: classes.inProgress },
      completed: { label: 'Completed', className: classes.completed },
      cancelled: { label: 'Cancelled', className: classes.cancelled }
    };

    const statusInfo = statusMap[status] || statusMap.created;

    return (
      <Chip
        label={statusInfo.label}
        className={`${classes.statusChip} ${statusInfo.className}`}
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
      <div className={classes.header}>
        <Typography variant="h5">Appointments</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          New Appointment
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table className={classes.table}>
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
        </Table>
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
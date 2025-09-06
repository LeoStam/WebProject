// src/pages/Appointments/AppointmentDialog.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api.service';
import TaskManager from '../../components/TaskManager';

const AppointmentDialog = ({ open, onClose, appointment }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [cars, setCars] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [customers, setCustomers] = useState([]);

  const appointmentSchema = Yup.object().shape({
    date: Yup.date()
      .min(new Date(), 'Date cannot be in the past')
      .required('Date is required'),
    start_time: Yup.string()
      .oneOf(['08:00', '10:00', '12:00', '14:00'], 'Please select a valid time slot')
      .required('Time is required'),
    reason: Yup.string()
      .oneOf(['repair', 'service'], 'Invalid reason')
      .required('Reason is required'),
    car_vin: Yup.string()
      .required('Car is required'),
    problem_description: Yup.string(),
    ...(user.role === 'secretary' && {
      customer_id: Yup.string().required('Customer is required')
    })
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requests = [
          user.role === 'secretary' ? api.get('/users?role=customer') : null,
          user.role === 'secretary' ? api.get('/cars') : api.get('/cars')
        ].filter(Boolean);

        const responses = await Promise.all(requests);
        
        if (user.role === 'secretary') {
          setCustomers(responses[0]?.data || []);
          setCars(responses[1]?.data || []);
        } else {
          setCars(responses[0]?.data || []);
        }

        // Fetch mechanics for secretaries
        if (user.role === 'secretary') {
          const mechanicsRes = await api.get('/users?role=mechanic');
          setMechanics(mechanicsRes.data);
        }
      } catch (error) {
        enqueueSnackbar('Failed to fetch data', { variant: 'error' });
      }
    };

    if (open) {
      fetchData();
    }
  }, [user.role, open]);

  const initialValues = appointment ? {
    ...appointment,
    date: appointment.date.split('T')[0]
  } : {
    date: new Date().toISOString().split('T')[0],
    start_time: '08:00',
    reason: 'service',
    car_vin: '',
    problem_description: '',
    mechanic_id: '',
    customer_id: user.role === 'secretary' ? '' : user.id
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      // Custom validation for repair appointments
      if (values.reason === 'repair' && (!values.problem_description || values.problem_description.trim().length < 5)) {
        setFieldError('problem_description', 'Problem description is required for repairs and must be at least 5 characters');
        setSubmitting(false);
        return;
      }

      if (appointment) {
        await api.put(`/appointments/${appointment.id}`, values);
        enqueueSnackbar('Appointment updated successfully', { variant: 'success' });
      } else {
        await api.post('/appointments', values);
        enqueueSnackbar('Appointment created successfully', { variant: 'success' });
      }
      onClose(true);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Operation failed', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        {appointment ? 'Edit Appointment' : 'New Appointment'}
      </DialogTitle>
      
      <Formik
        initialValues={initialValues}
        validationSchema={appointmentSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <DialogContent>
              <Grid container spacing={2}>
                {user.role === 'secretary' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      margin="normal"
                      name="customer_id"
                      label="Customer"
                      value={values.customer_id}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.customer_id && Boolean(errors.customer_id)}
                      helperText={touched.customer_id && errors.customer_id}
                    >
                      {customers.map((customer) => (
                        <MenuItem key={customer.id} value={customer.id}>
                          {customer.full_name} ({customer.email})
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="date"
                    label="Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={values.date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.date && Boolean(errors.date)}
                    helperText={touched.date && errors.date}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    margin="normal"
                    name="start_time"
                    label="Time"
                    value={values.start_time}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.start_time && Boolean(errors.start_time)}
                    helperText={touched.start_time && errors.start_time}
                  >
                    <MenuItem value="08:00">08:00 - 10:00</MenuItem>
                    <MenuItem value="10:00">10:00 - 12:00</MenuItem>
                    <MenuItem value="12:00">12:00 - 14:00</MenuItem>
                    <MenuItem value="14:00">14:00 - 16:00</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    margin="normal"
                    name="reason"
                    label="Reason"
                    value={values.reason}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.reason && Boolean(errors.reason)}
                    helperText={touched.reason && errors.reason}
                  >
                    <MenuItem value="service">Service</MenuItem>
                    <MenuItem value="repair">Repair</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    margin="normal"
                    name="car_vin"
                    label="Car"
                    value={values.car_vin}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.car_vin && Boolean(errors.car_vin)}
                    helperText={touched.car_vin && errors.car_vin}
                  >
                    {cars
                      .filter(car => user.role !== 'secretary' || car.owner_id === values.customer_id)
                      .map((car) => (
                        <MenuItem key={car.vin} value={car.vin}>
                          {`${car.brand} ${car.model} (${car.vin})`}
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>

                {user.role === 'secretary' && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      margin="normal"
                      name="mechanic_id"
                      label="Mechanic"
                      value={values.mechanic_id}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.mechanic_id && Boolean(errors.mechanic_id)}
                      helperText={touched.mechanic_id && errors.mechanic_id}
                    >
                      {mechanics.map((mechanic) => (
                        <MenuItem key={mechanic.id} value={mechanic.id}>
                          {mechanic.full_name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                )}

                {values.reason === 'repair' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      margin="normal"
                      name="problem_description"
                      label="Problem Description"
                      multiline
                      rows={4}
                      value={values.problem_description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.problem_description && Boolean(errors.problem_description)}
                      helperText={touched.problem_description && errors.problem_description}
                    />
                  </Grid>
                )}
              </Grid>

              {/* Task Manager - Only show for in_progress appointments when editing */}
              {appointment && appointment.status === 'in_progress' && (
                <TaskManager appointment={appointment} />
              )}
            </DialogContent>

            <DialogActions>
              <Button onClick={() => onClose(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={isSubmitting}
              >
                {appointment ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AppointmentDialog;
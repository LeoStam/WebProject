// Simple version to test basic functionality
import React, { useState, useEffect } from 'react';
import { Typography, Paper, CircularProgress, Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import api from '../../services/api.service';

const AppointmentsListSimple = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        console.log('Fetching appointments...');
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        console.log('Token value:', token);
        
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // Check if token looks like a valid JWT (should have 3 parts separated by dots)
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          console.error('Invalid JWT format - clearing token');
          localStorage.removeItem('token');
          localStorage.removeItem('rememberMe');
          window.location.href = '/login';
          return;
        }
        
        const response = await api.get('/appointments');
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        console.log('Response data:', response.data);
        console.log('Response data type:', typeof response.data);
        
        if (response.data && response.data.success) {
          const data = response.data.data || [];
          console.log('Appointments data:', data);
          setAppointments(Array.isArray(data) ? data : []);
        } else {
          console.log('Unexpected response format:', response.data);
          setAppointments([]);
        }
      } catch (error) {
        console.error('Full error object:', error);
        console.error('Error message:', error.message);
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response?.data);
        console.error('Error response status:', error.response?.status);
        
        if (error.response?.status === 401 || error.message.includes('jwt') || error.message.includes('token')) {
          console.log('Authentication error - clearing token and redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('rememberMe');
          setError('Authentication failed. Redirecting to login...');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          setError(`API Error: ${error.message}`);
        }
        
        enqueueSnackbar('Failed to fetch appointments', { variant: 'error' });
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [enqueueSnackbar]);

  if (loading) {
    return (
      <Paper style={{ padding: 20, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Loading appointments...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper style={{ padding: 20 }}>
        <Typography color="error">Error: {error}</Typography>
        <Typography>Please check the console for more details.</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          style={{ marginTop: 10 }}
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('rememberMe');
            window.location.href = '/login';
          }}
        >
          Clear Token & Login Again
        </Button>
      </Paper>
    );
  }

  return (
    <Paper style={{ padding: 20 }}>
      <Typography variant="h5" gutterBottom>
        Appointments ({appointments.length})
      </Typography>
      
      {appointments.length === 0 ? (
        <Typography>No appointments found.</Typography>
      ) : (
        <div>
          <Typography>Found {appointments.length} appointments</Typography>
          {appointments.slice(0, 3).map((appointment, index) => (
            <div key={appointment.id || index} style={{ marginTop: 10, padding: 10, border: '1px solid #ccc' }}>
              <Typography>Appointment ID: {appointment.id}</Typography>
              <Typography>Status: {appointment.status}</Typography>
              <Typography>Date: {appointment.date}</Typography>
            </div>
          ))}
        </div>
      )}
    </Paper>
  );
};

export default AppointmentsListSimple;

import React from 'react';
import { Container, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome, {user.full_name}
      </Typography>
      <Typography variant="body1">
        Role: {user.role}
      </Typography>
    </Container>
  );
};

export default Dashboard;
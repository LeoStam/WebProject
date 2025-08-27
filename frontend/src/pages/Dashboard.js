import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EventIcon from '@mui/icons-material/Event';
import BuildIcon from '@mui/icons-material/Build';
import { useAuth } from '../context/AuthContext';
import UsersList from './Users/UsersList';
import CarsList from './Cars/CarsList';
import AppointmentsList from './Appointments/AppointmentsList';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
  color: theme.palette.text.secondary,
}));

const StyledIcon = styled('div')(({ theme }) => ({
  fontSize: '3rem',
  marginBottom: theme.spacing(2),
  '& > svg': {
    fontSize: 'inherit',
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>{children}</Box>
      )}
    </div>
  );
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCars: 0,
    totalAppointments: 0,
    pendingTasks: 0
  });
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      if (user.role === 'admin') {
        try {
          const token = localStorage.getItem('token');
          console.log('Using token:', token);
          const response = await fetch('http://localhost:3000/api/stats', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('Stats response:', response.status);
          if (response.ok) {
            const data = await response.json();
            console.log('Stats data:', data);
            setStats(data);
          } else {
            const error = await response.json();
            console.error('Stats error:', error);
          }
        } catch (error) {
          console.error('Error fetching stats:', error);
        }
      }
    };

    fetchStats();
  }, [user.role]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user.full_name}
      </Typography>

      {user.role === 'admin' && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StyledPaper elevation={3}>
                <StyledIcon>
                  <PeopleIcon color="primary" />
                </StyledIcon>
                <Typography variant="h6">Total Users</Typography>
                <Typography variant="h3">{stats.totalUsers}</Typography>
              </StyledPaper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StyledPaper elevation={3}>
                <StyledIcon>
                  <DirectionsCarIcon color="primary" />
                </StyledIcon>
                <Typography variant="h6">Registered Cars</Typography>
                <Typography variant="h3">{stats.totalCars}</Typography>
              </StyledPaper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StyledPaper elevation={3}>
                <StyledIcon>
                  <EventIcon color="primary" />
                </StyledIcon>
                <Typography variant="h6">Appointments</Typography>
                <Typography variant="h3">{stats.totalAppointments}</Typography>
              </StyledPaper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StyledPaper elevation={3}>
                <StyledIcon>
                  <BuildIcon color="primary" />
                </StyledIcon>
                <Typography variant="h6">Pending Tasks</Typography>
                <Typography variant="h3">{stats.pendingTasks}</Typography>
              </StyledPaper>
            </Grid>
          </Grid>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label="Users" />
              <Tab label="Cars" />
              <Tab label="Appointments" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <UsersList />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <CarsList />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <AppointmentsList />
          </TabPanel>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
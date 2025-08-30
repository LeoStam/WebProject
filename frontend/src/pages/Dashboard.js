import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EventIcon from '@mui/icons-material/Event';
import BuildIcon from '@mui/icons-material/Build';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../context/AuthContext';
import UsersList from './Users/UsersList';
import CarsList from './Cars/CarsList';
import AppointmentsList from './Appointments/AppointmentsList';
import api from '../services/api.service';

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
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCars: 0,
    totalAppointments: 0,
    pendingTasks: 0
  });
  const [userStats, setUserStats] = useState({
    myCars: 0,
    myAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0
  });
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user.role === 'secretary') {
          // Fetch admin stats for secretary
          const response = await api.get('/stats');
          if (response.data) {
            setStats(response.data);
          }
        } else {
          // Fetch user-specific stats for customers and mechanics
          const [carsResponse, appointmentsResponse] = await Promise.all([
            api.get('/cars'),
            api.get('/appointments')
          ]);
          
          const cars = carsResponse.data || [];
          const appointments = appointmentsResponse.data.data || [];
          
          setUserStats({
            myCars: cars.length,
            myAppointments: appointments.length,
            pendingAppointments: appointments.filter(a => a.status === 'created' || a.status === 'in_progress').length,
            completedAppointments: appointments.filter(a => a.status === 'completed').length
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [user.role]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Secretary Dashboard
  if (user.role === 'secretary') {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user.full_name}
        </Typography>

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
      </Box>
    );
  }

  // Customer Dashboard
  if (user.role === 'customer') {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user.full_name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Here's an overview of your cars and appointments
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StyledPaper elevation={3}>
              <StyledIcon>
                <DirectionsCarIcon color="primary" />
              </StyledIcon>
              <Typography variant="h6">My Cars</Typography>
              <Typography variant="h3">{userStats.myCars}</Typography>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StyledPaper elevation={3}>
              <StyledIcon>
                <EventIcon color="primary" />
              </StyledIcon>
              <Typography variant="h6">Total Appointments</Typography>
              <Typography variant="h3">{userStats.myAppointments}</Typography>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StyledPaper elevation={3}>
              <StyledIcon>
                <BuildIcon color="warning" />
              </StyledIcon>
              <Typography variant="h6">Pending</Typography>
              <Typography variant="h3">{userStats.pendingAppointments}</Typography>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StyledPaper elevation={3}>
              <StyledIcon>
                <EventIcon color="success" />
              </StyledIcon>
              <Typography variant="h6">Completed</Typography>
              <Typography variant="h3">{userStats.completedAppointments}</Typography>
            </StyledPaper>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Manage your cars and book appointments
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/cars')}
                >
                  Add Car
                </Button>
                <Button 
                  size="small" 
                  variant="outlined"
                  startIcon={<EventIcon />}
                  onClick={() => navigate('/appointments')}
                >
                  Book Appointment
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userStats.myAppointments > 0 
                    ? `You have ${userStats.pendingAppointments} pending appointments and ${userStats.completedAppointments} completed ones.`
                    : "You haven't booked any appointments yet. Click 'Book Appointment' to get started!"
                  }
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate('/appointments')}>
                  View All Appointments
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Mechanic Dashboard
  if (user.role === 'mechanic') {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user.full_name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Here are your assigned appointments and work overview
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StyledPaper elevation={3}>
              <StyledIcon>
                <EventIcon color="primary" />
              </StyledIcon>
              <Typography variant="h6">Assigned Appointments</Typography>
              <Typography variant="h3">{userStats.myAppointments}</Typography>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StyledPaper elevation={3}>
              <StyledIcon>
                <BuildIcon color="warning" />
              </StyledIcon>
              <Typography variant="h6">In Progress</Typography>
              <Typography variant="h3">{userStats.pendingAppointments}</Typography>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StyledPaper elevation={3}>
              <StyledIcon>
                <EventIcon color="success" />
              </StyledIcon>
              <Typography variant="h6">Completed</Typography>
              <Typography variant="h3">{userStats.completedAppointments}</Typography>
            </StyledPaper>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Work Overview
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {userStats.myAppointments > 0 
                    ? `You have ${userStats.pendingAppointments} appointments in progress and ${userStats.completedAppointments} completed jobs.`
                    : "No appointments assigned yet. Check back later for new work assignments."
                  }
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate('/appointments')}>
                  View My Appointments
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tools & Resources
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Access customer information and appointment details
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate('/cars')}>
                  View All Cars
                </Button>
                <Button size="small" onClick={() => navigate('/appointments')}>
                  My Work Schedule
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Fallback for any other role
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user.full_name}
      </Typography>
      <Typography variant="body1">
        Your dashboard is being prepared...
      </Typography>
    </Box>
  );
};

export default Dashboard;
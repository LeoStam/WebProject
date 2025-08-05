import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box, Paper } from '@mui/material';

import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
  hero: {
    padding: theme.spacing(8, 0, 6),
    backgroundColor: theme.palette.background.paper,
  },
  buttons: {
    marginTop: theme.spacing(4),
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(2)
  },
  button: {
    padding: theme.spacing(1, 4),
  },
  paper: {
    padding: theme.spacing(4),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(4),
  },
  services: {
    marginTop: theme.spacing(2),
    '& > *': {
      marginBottom: theme.spacing(1),
    }
  }
}));

const Landing = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box className={classes.hero}>
        <Typography 
          component="h1" 
          variant="h2" 
          align="center" 
          color="textPrimary" 
          gutterBottom
        >
          Car Garage Management System
        </Typography>
        <Typography 
          variant="h5" 
          align="center" 
          color="textSecondary" 
          paragraph
        >
          Professional Vehicle Maintenance & Repair Services
        </Typography>
        <div className={classes.buttons}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            color="primary"
            className={classes.button}
            onClick={() => navigate('/register')}
          >
            Register
          </Button>
        </div>
      </Box>
      
      <Paper className={classes.paper}>
        <Typography variant="h6" gutterBottom>
          Our Services
        </Typography>
        <div className={classes.services}>
          <Typography variant="body1">
            • Professional Vehicle Maintenance
          </Typography>
          <Typography variant="body1">
            • Expert Mechanical Repairs
          </Typography>
          <Typography variant="body1">
            • Online Appointment Booking
          </Typography>
          <Typography variant="body1">
            • Real-time Service Tracking
          </Typography>
        </div>
      </Paper>
    </Container>
  );
};

export default Landing;
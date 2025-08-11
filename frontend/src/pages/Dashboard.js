import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  makeStyles
} from '@material-ui/core';
import { useAuth } from '../context/AuthContext';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  statsPaper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const { user } = useAuth();

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Welcome, {user.full_name}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper className={classes.statsPaper}>
            <Typography variant="h6">Total Appointments</Typography>
            <Typography variant="h3">0</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className={classes.statsPaper}>
            <Typography variant="h6">Active Cars</Typography>
            <Typography variant="h3">0</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className={classes.statsPaper}>
            <Typography variant="h6">Pending Tasks</Typography>
            <Typography variant="h3">0</Typography>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
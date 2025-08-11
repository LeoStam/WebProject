// src/layouts/MainLayout.js
import React from 'react';
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  makeStyles
} from '@material-ui/core';
import {
  Menu as MenuIcon,
  Dashboard,
  DirectionsCar,
  Event,
  Person,
  ExitToApp
} from '@material-ui/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    marginTop: 64,
  },
  title: {
    flexGrow: 1,
  },
}));

const MainLayout = ({ children }) => {
  const classes = useStyles();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Cars', icon: <DirectionsCar />, path: '/cars' },
    { text: 'Appointments', icon: <Event />, path: '/appointments' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
  ];

  if (user?.role === 'secretary') {
    menuItems.push(
      { text: 'Users', icon: <Person />, path: '/users' }
    );
  }

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Garage Management
          </Typography>
          <IconButton color="inherit" onClick={logout}>
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <main className={classes.content}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
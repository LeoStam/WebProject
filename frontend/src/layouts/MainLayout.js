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
  styled
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const Root = styled('div')({
  display: 'flex',
});

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
}));

const StyledDrawer = styled(Drawer)({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
  },
});

const MainContent = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: 64,
}));

const Title = styled(Typography)({
  flexGrow: 1,
});

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Cars', icon: <DirectionsCarIcon />, path: '/cars' },
    { text: 'Appointments', icon: <EventIcon />, path: '/appointments' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
  ];

  if (user?.role === 'secretary') {
    menuItems.push(
      { text: 'Users', icon: <PersonIcon />, path: '/users' }
    );
  }

  return (
    <Root>
      <StyledAppBar position="fixed">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Title variant="h6">
            Garage Management
          </Title>
          <IconButton color="inherit" onClick={logout}>
            <ExitToAppIcon />
          </IconButton>
        </Toolbar>
      </StyledAppBar>

      <StyledDrawer variant="permanent">
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
      </StyledDrawer>

      <MainContent>
        {children}
      </MainContent>
    </Root>
  );
};

export default MainLayout;
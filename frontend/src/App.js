import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from './context/AuthContext';
import theme from './theme';
import MainLayout from './layouts/MainLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RequestPasswordReset from './pages/RequestPasswordReset';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import { Box } from '@mui/material';
import CarsList from './pages/Cars/CarsList';
import AppointmentsList from './pages/Appointments/AppointmentsList';
import UsersList from './pages/Users/UsersList';
import Profile from './pages/Profile/Profile';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <Router>
            <Box bgcolor="background.default" minHeight="100vh">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/request-reset" element={<RequestPasswordReset />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Dashboard />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cars"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <CarsList />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/appointments"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <AppointmentsList />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute roles={['secretary']}>
                      <MainLayout>
                        <UsersList />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Profile />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Box>
          </Router>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
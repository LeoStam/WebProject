import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import { TextField, Button, Paper, Typography, Container, Box, Checkbox, FormControlLabel } from '@mui/material';
import { Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../utils/validationSchemas';

const Login = () => {
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} style={{ padding: 20, marginTop: 50 }}>
        <Typography component="h1" variant="h5" align="center">
          Sign In
        </Typography>
        
        {error && (
          <Alert severity="error" style={{ marginTop: 10 }}>
            {error}
          </Alert>
        )}

        <Formik
          initialValues={{
            email: '',
            password: '',
            rememberMe: false
          }}
          validationSchema={loginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await login(values, values.rememberMe);
              navigate('/dashboard');
            } catch (err) {
              setError(err.response?.data?.message || 'Login failed');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form>
              <TextField
                margin="normal"
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <TextField
                margin="normal"
                fullWidth
                name="password"
                label="Password"
                type="password"
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    color="primary"
                    checked={values.rememberMe}
                    onChange={handleChange}
                  />
                }
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                style={{ marginTop: 20 }}
              >
                Sign In
              </Button>
              <Box mt={2} display="flex" justifyContent="space-between">
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => navigate('/reset-password')}
                >
                  Forgot Password?
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default Login;
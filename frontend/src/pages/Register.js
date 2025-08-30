import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import {
  TextField,
  Button,
  Paper,
  Typography,
  Container,
  Box,
  MenuItem,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { Alert } from '@mui/material';
import { registerSchema } from '../utils/validationSchemas';
import { authService } from '../services/api.service';

const steps = ['Basic Information', 'Account Details', 'Role Specific Details'];

const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const initialValues = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    id_number: '',
    role: 'customer',
    afm: '',
    address: '',
    specialty: ''
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Custom validation for role-specific fields
      if (values.role === 'customer') {
        if (!values.afm || !/^[0-9]{9}$/.test(values.afm)) {
          setError('AFM is required and must be exactly 9 digits for customers');
          setSubmitting(false);
          return;
        }
        if (!values.address || values.address.length < 5) {
          setError('Address is required and must be at least 5 characters for customers');
          setSubmitting(false);
          return;
        }
      }
      
      if (values.role === 'mechanic') {
        if (!values.specialty || values.specialty.length < 3) {
          setError('Specialty is required and must be at least 3 characters for mechanics');
          setSubmitting(false);
          return;
        }
      }

      const { confirmPassword, ...submitData } = values;
      await authService.register(submitData);
      setSuccess('Registration successful! Please wait for account activation.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setSubmitting(false);
    }
  };

  const renderStepContent = (step, formProps) => {
    const { values, errors, touched, handleChange, handleBlur } = formProps;

    switch (step) {
      case 0:
        return (
          <>
            <TextField
              fullWidth
              margin="normal"
              name="full_name"
              label="Full Name"
              error={touched.full_name && Boolean(errors.full_name)}
              helperText={touched.full_name && errors.full_name}
              value={values.full_name}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <TextField
              fullWidth
              margin="normal"
              name="id_number"
              label="ID Number"
              error={touched.id_number && Boolean(errors.id_number)}
              helperText={touched.id_number && errors.id_number}
              value={values.id_number}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </>
        );
      case 1:
        return (
          <>
            <TextField
              fullWidth
              margin="normal"
              name="username"
              label="Username"
              error={touched.username && Boolean(errors.username)}
              helperText={touched.username && errors.username}
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <TextField
              fullWidth
              margin="normal"
              name="email"
              label="Email"
              type="email"
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email}
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <TextField
              fullWidth
              margin="normal"
              name="password"
              label="Password"
              type="password"
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <TextField
              fullWidth
              margin="normal"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              error={touched.confirmPassword && Boolean(errors.confirmPassword)}
              helperText={touched.confirmPassword && errors.confirmPassword}
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </>
        );
      case 2:
        return (
          <>
            <TextField
              select
              fullWidth
              margin="normal"
              name="role"
              label="Role"
              error={touched.role && Boolean(errors.role)}
              helperText={touched.role && errors.role}
              value={values.role}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="mechanic">Mechanic</MenuItem>
            </TextField>
            {values.role === 'customer' && (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  name="afm"
                  label="AFM"
                  error={touched.afm && Boolean(errors.afm)}
                  helperText={touched.afm && errors.afm}
                  value={values.afm}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  name="address"
                  label="Address"
                  error={touched.address && Boolean(errors.address)}
                  helperText={touched.address && errors.address}
                  value={values.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </>
            )}
            {values.role === 'mechanic' && (
              <TextField
                fullWidth
                margin="normal"
                name="specialty"
                label="Specialty"
                error={touched.specialty && Boolean(errors.specialty)}
                helperText={touched.specialty && errors.specialty}
                value={values.specialty}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} style={{ padding: 20, marginTop: 50 }}>
        <Typography component="h1" variant="h5" align="center">
          Register
        </Typography>

        <Stepper activeStep={activeStep} style={{ margin: '20px 0' }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" style={{ marginTop: 10 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" style={{ marginTop: 10 }}>
            {success}
          </Alert>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={registerSchema}
          onSubmit={handleSubmit}
        >
          {(formProps) => (
            <Form>
              {renderStepContent(activeStep, formProps)}
              
              <Box mt={3} display="flex" justifyContent="space-between">
                <Button
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((prev) => prev - 1)}
                >
                  Back
                </Button>
                <div>
                  {activeStep < steps.length - 1 ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setActiveStep((prev) => prev + 1)}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={formProps.isSubmitting}
                    >
                      Register
                    </Button>
                  )}
                </div>
              </Box>
            </Form>
          )}
        </Formik>

        <Button
          fullWidth
          variant="text"
          color="primary"
          onClick={() => navigate('/login')}
          style={{ marginTop: 20 }}
        >
          Already have an account? Sign In
        </Button>
      </Paper>
    </Container>
  );
};

export default Register;
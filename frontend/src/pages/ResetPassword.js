import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Paper,
  Typography,
  Container
} from '@mui/material';
import { Alert } from '@mui/material';
import { authService } from '../services/api.service';

const resetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required')
});

const ResetPassword = () => {
  const [status, setStatus] = useState({ type: '', message: '' });
  const navigate = useNavigate();
  const { token } = useParams();

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} style={{ padding: 20, marginTop: 50 }}>
        <Typography component="h1" variant="h5" align="center">
          Set New Password
        </Typography>

        {status.message && (
          <Alert severity={status.type} style={{ marginTop: 10 }}>
            {status.message}
          </Alert>
        )}

        <Formik
          initialValues={{ password: '', confirmPassword: '' }}
          validationSchema={resetPasswordSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await authService.resetPassword(token, values.password);
              setStatus({
                type: 'success',
                message: 'Password has been reset successfully.'
              });
              setTimeout(() => navigate('/login'), 3000);
            } catch (error) {
              setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to reset password'
              });
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
                name="password"
                label="New Password"
                type="password"
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <TextField
                margin="normal"
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                helperText={touched.confirmPassword && errors.confirmPassword}
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                style={{ marginTop: 20 }}
              >
                Reset Password
              </Button>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default ResetPassword;
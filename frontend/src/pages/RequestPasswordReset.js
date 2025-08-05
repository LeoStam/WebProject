import React, { useState } from 'react';
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

const requestResetSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required')
});

const RequestPasswordReset = () => {
  const [status, setStatus] = useState({ type: '', message: '' });

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} style={{ padding: 20, marginTop: 50 }}>
        <Typography component="h1" variant="h5" align="center">
          Reset Password
        </Typography>

        {status.message && (
          <Alert severity={status.type} style={{ marginTop: 10 }}>
            {status.message}
          </Alert>
        )}

        <Formik
          initialValues={{ email: '' }}
          validationSchema={requestResetSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await authService.requestPasswordReset(values.email);
              setStatus({
                type: 'success',
                message: 'Password reset instructions have been sent to your email.'
              });
            } catch (error) {
              setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to request password reset'
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
                id="email"
                name="email"
                label="Email Address"
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                value={values.email}
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
                Request Password Reset
              </Button>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default RequestPasswordReset;
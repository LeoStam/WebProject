// src/pages/Profile/ChangePasswordDialog.js
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import api from '../../services/api.service';

const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required')
});

const ChangePasswordDialog = ({ open, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await api.post('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      
      enqueueSnackbar('Password changed successfully', { variant: 'success' });
      resetForm();
      onClose();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to change password', {
        variant: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Change Password</DialogTitle>

      <Formik
        initialValues={{
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }}
        validationSchema={passwordSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <DialogContent>
              <TextField
                fullWidth
                margin="normal"
                name="currentPassword"
                label="Current Password"
                type="password"
                value={values.currentPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.currentPassword && Boolean(errors.currentPassword)}
                helperText={touched.currentPassword && errors.currentPassword}
              />

              <TextField
                fullWidth
                margin="normal"
                name="newPassword"
                label="New Password"
                type="password"
                value={values.newPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.newPassword && Boolean(errors.newPassword)}
                helperText={touched.newPassword && errors.newPassword}
              />

              <TextField
                fullWidth
                margin="normal"
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                helperText={touched.confirmPassword && errors.confirmPassword}
              />
            </DialogContent>

            <DialogActions>
              <Button onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={isSubmitting}
              >
                Change Password
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default ChangePasswordDialog;
// src/pages/Users/UserDialog.js
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem
} from '@material-ui/core';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import api from '../../services/api.service';

const userSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  full_name: Yup.string()
    .required('Full name is required'),
  role: Yup.string()
    .oneOf(['customer', 'mechanic', 'secretary'], 'Invalid role')
    .required('Role is required'),
  // Only validate password if it's a new user or if password is being changed
  password: Yup.string()
    .when('$isNewUser', {
      is: true,
      then: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required')
    }),
  id_number: Yup.string()
    .required('ID number is required'),
  // Conditional validation based on role
  specialty: Yup.string()
    .when('role', {
      is: 'mechanic',
      then: Yup.string().required('Specialty is required for mechanics')
    }),
  afm: Yup.string()
    .when('role', {
      is: 'customer',
      then: Yup.string()
        .length(9, 'AFM must be exactly 9 digits')
        .required('AFM is required for customers')
    }),
  address: Yup.string()
    .when('role', {
      is: 'customer',
      then: Yup.string().required('Address is required for customers')
    })
});

const UserDialog = ({ open, onClose, user }) => {
  const { enqueueSnackbar } = useSnackbar();

  const initialValues = user ? {
    ...user,
    password: '', // Don't show existing password
    specialty: user.Mechanic?.specialty || '',
    afm: user.Customer?.afm || '',
    address: user.Customer?.address || ''
  } : {
    username: '',
    email: '',
    password: '',
    full_name: '',
    id_number: '',
    role: 'customer',
    specialty: '',
    afm: '',
    address: ''
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (user) {
        await api.put(`/users/${user.id}`, values);
        enqueueSnackbar('User updated successfully', { variant: 'success' });
      } else {
        await api.post('/users', values);
        enqueueSnackbar('User created successfully', { variant: 'success' });
      }
      onClose(true);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Operation failed', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        {user ? 'Edit User' : 'Create User'}
      </DialogTitle>
      
      <Formik
        initialValues={initialValues}
        validationSchema={userSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={true}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="username"
                    label="Username"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.username && Boolean(errors.username)}
                    helperText={touched.username && errors.username}
                    disabled={!!user}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="email"
                    label="Email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Grid>

                {!user && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                    />
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="full_name"
                    label="Full Name"
                    value={values.full_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.full_name && Boolean(errors.full_name)}
                    helperText={touched.full_name && errors.full_name}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="id_number"
                    label="ID Number"
                    value={values.id_number}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.id_number && Boolean(errors.id_number)}
                    helperText={touched.id_number && errors.id_number}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    name="role"
                    label="Role"
                    value={values.role}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.role && Boolean(errors.role)}
                    helperText={touched.role && errors.role}
                    disabled={!!user}
                  >
                    <MenuItem value="customer">Customer</MenuItem>
                    <MenuItem value="mechanic">Mechanic</MenuItem>
                    <MenuItem value="secretary">Secretary</MenuItem>
                  </TextField>
                </Grid>

                {values.role === 'mechanic' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="specialty"
                      label="Specialty"
                      value={values.specialty}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.specialty && Boolean(errors.specialty)}
                      helperText={touched.specialty && errors.specialty}
                    />
                  </Grid>
                )}

                {values.role === 'customer' && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="afm"
                        label="AFM"
                        value={values.afm}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.afm && Boolean(errors.afm)}
                        helperText={touched.afm && errors.afm}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="address"
                        label="Address"
                        value={values.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.address && Boolean(errors.address)}
                        helperText={touched.address && errors.address}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => onClose(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={isSubmitting}
              >
                {user ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default UserDialog;
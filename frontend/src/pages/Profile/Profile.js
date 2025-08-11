// src/pages/Profile/Profile.js
import React, { useState } from 'react';
import {
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  makeStyles
} from '@material-ui/core';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import ChangePasswordDialog from './ChangePasswordDialog';

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 800,
    margin: '0 auto',
    padding: theme.spacing(3)
  },
  header: {
    marginBottom: theme.spacing(4)
  },
  card: {
    marginBottom: theme.spacing(3)
  },
  divider: {
    margin: theme.spacing(3, 0)
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(3)
  }
}));

const profileSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  full_name: Yup.string()
    .required('Full name is required'),
  // Role-specific fields
  specialty: Yup.string()
    .when('role', {
      is: 'mechanic',
      then: Yup.string().required('Specialty is required')
    }),
  afm: Yup.string()
    .when('role', {
      is: 'customer',
      then: Yup.string()
        .length(9, 'AFM must be exactly 9 digits')
        .required('AFM is required')
    }),
  address: Yup.string()
    .when('role', {
      is: 'customer',
      then: Yup.string().required('Address is required')
    })
});

const Profile = () => {
  const classes = useStyles();
  const { user, updateUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const initialValues = {
    email: user.email,
    full_name: user.full_name,
    specialty: user.Mechanic?.specialty || '',
    afm: user.Customer?.afm || '',
    address: user.Customer?.address || ''
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await updateUser(values);
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Update failed', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper className={classes.root}>
      <div className={classes.header}>
        <Typography variant="h4" gutterBottom>
          Profile Settings
        </Typography>
        <Typography color="textSecondary">
          Manage your account settings and profile information
        </Typography>
      </div>

      <Card className={classes.card}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Account Information
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                value={user.username}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Role"
                value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                disabled
              />
            </Grid>
          </Grid>

          <Button
            variant="outlined"
            color="primary"
            onClick={() => setPasswordDialogOpen(true)}
            style={{ marginTop: 16 }}
          >
            Change Password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Profile Information
          </Typography>

          <Formik
            initialValues={initialValues}
            validationSchema={profileSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="email"
                      label="Email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  </Grid>

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

                  {user.role === 'mechanic' && (
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

                  {user.role === 'customer' && (
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

                  <Grid item xs={12}>
                    <div className={classes.buttonContainer}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
      />
    </Paper>
  );
};

export default Profile;
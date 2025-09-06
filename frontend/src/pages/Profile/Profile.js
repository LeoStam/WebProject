// src/pages/Profile/Profile.js
import React, { useContext, useState, useEffect } from 'react';
import {
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  styled
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import { MECHANIC_SPECIALTIES } from '../../utils/constants';
import ChangePasswordDialog from './ChangePasswordDialog';

const Root = styled(Paper)(({ theme }) => ({
  maxWidth: 800,
  margin: '0 auto',
  padding: theme.spacing(3)
}));

const Header = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(4)
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3)
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(3, 0)
}));

const ButtonContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: theme.spacing(3)
}));

const profileSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  full_name: Yup.string().required('Full name is required'),
  afm: Yup.string(),
  address: Yup.string(),
  specialty: Yup.string()
    .when('$userRole', {
      is: 'mechanic',
      then: (schema) => schema
        .oneOf(MECHANIC_SPECIALTIES.map(s => s.value), 'Please select a valid specialty')
        .required('Specialty is required')
    })
});

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Debug logging
  console.log('🔍 Profile - Current user:', user);
  console.log('🔍 Profile - Customer profile:', user?.customerProfile);
  console.log('🔍 Profile - Mechanic profile:', user?.mechanicProfile);

  const initialValues = {
    email: user?.email || '',
    full_name: user?.full_name || '',
    specialty: user?.mechanicProfile?.specialty || '',
    afm: user?.customerProfile?.afm || '',
    address: user?.customerProfile?.address || ''
  };

  // Debug the initial values too
  console.log('🔍 Profile - Initial values:', initialValues);

  // Debug when user data changes
  useEffect(() => {
    console.log('🔄 Profile - User data changed:', user);
    console.log('🔄 Profile - Customer profile changed:', user?.customerProfile);
  }, [user]);

  // Don't render if user is not loaded yet
  if (!user) {
    return <div>Loading...</div>;
  }

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      // Custom validation for role-specific fields
      if (user.role === 'customer') {
        if (!values.afm || !/^[0-9]{9}$/.test(values.afm)) {
          setFieldError('afm', 'AFM is required and must be exactly 9 digits');
          setSubmitting(false);
          return;
        }
        if (!values.address || values.address.length < 5) {
          setFieldError('address', 'Address is required and must be at least 5 characters');
          setSubmitting(false);
          return;
        }
      }
      
      if (user.role === 'mechanic') {
        if (!values.specialty) {
          setFieldError('specialty', 'Specialty is required for mechanics');
          setSubmitting(false);
          return;
        }
      }

      await updateUser(values);
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Update failed', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Root>
      <Header>
        <Typography variant="h4" gutterBottom>
          Profile Settings
        </Typography>
        <Typography color="textSecondary">
          Manage your account settings and profile information
        </Typography>
      </Header>

      <StyledCard>
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
      </StyledCard>

      <StyledCard>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Profile Information
          </Typography>

          <Formik
            initialValues={initialValues}
            enableReinitialize={true}
            validationSchema={profileSchema}
            validationContext={{ userRole: user?.role }}
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
                      <FormControl fullWidth error={touched.specialty && Boolean(errors.specialty)}>
                        <InputLabel>Specialty</InputLabel>
                        <Select
                          name="specialty"
                          value={MECHANIC_SPECIALTIES.find(s => s.value === values.specialty)?.value || ''}
                          onChange={handleChange}
                          label="Specialty"
                        >
                          <MenuItem value="">Select a specialty</MenuItem>
                          {MECHANIC_SPECIALTIES.map((specialty) => (
                            <MenuItem key={specialty.value} value={specialty.value}>
                              {specialty.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.specialty && errors.specialty && (
                          <FormHelperText>{errors.specialty}</FormHelperText>
                        )}
                      </FormControl>
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
                    <ButtonContainer>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
                      >
                        Save Changes
                      </Button>
                    </ButtonContainer>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </CardContent>
      </StyledCard>

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
      />
    </Root>
  );
};

export default Profile;
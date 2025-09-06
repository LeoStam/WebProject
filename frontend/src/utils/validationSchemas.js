import * as Yup from 'yup';
import { MECHANIC_SPECIALTIES } from './constants';

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
});

export const registerSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  full_name: Yup.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .required('Full name is required'),
  id_number: Yup.string()
    .matches(/^[A-Z0-9]+$/, 'ID number must contain only uppercase letters and numbers')
    .min(6, 'ID number must be at least 6 characters')
    .required('ID number is required'),
  role: Yup.string()
    .oneOf(['customer', 'mechanic'], 'Invalid role')
    .required('Role is required'),
  specialty: Yup.string()
    .when('role', {
      is: 'mechanic',
      then: (schema) => schema
        .oneOf(MECHANIC_SPECIALTIES.map(s => s.value), 'Please select a valid specialty')
        .required('Specialty is required for mechanics')
    })
});
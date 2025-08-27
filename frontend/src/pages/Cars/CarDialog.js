// src/pages/Cars/CarDialog.js
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import api from '../../services/api.service';

const carSchema = Yup.object().shape({
  vin: Yup.string()
    .length(17, 'VIN must be exactly 17 characters')
    .required('VIN is required'),
  brand: Yup.string()
    .required('Brand is required'),
  model: Yup.string()
    .required('Model is required'),
  production_year: Yup.number()
    .min(1900, 'Year must be after 1900')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future')
    .required('Production year is required'),
  vehicle_type: Yup.string()
    .oneOf(['passenger', 'truck', 'bus', 'motorcycle'], 'Invalid vehicle type')
    .required('Vehicle type is required'),
  fuel_type: Yup.string()
    .oneOf(['petrol', 'diesel', 'electric', 'hybrid', 'lpg'], 'Invalid fuel type')
    .required('Fuel type is required'),
  doors_count: Yup.number()
    .min(0, 'Cannot have negative doors')
    .max(10, 'Too many doors')
    .required('Door count is required')
});

const CarDialog = ({ open, onClose, car }) => {
  const { enqueueSnackbar } = useSnackbar();

  const initialValues = car ? {
    ...car
  } : {
    vin: '',
    brand: '',
    model: '',
    production_year: new Date().getFullYear(),
    vehicle_type: 'passenger',
    fuel_type: 'petrol',
    doors_count: 4
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (car) {
        await api.put(`/cars/${car.vin}`, values);
        enqueueSnackbar('Car updated successfully', { variant: 'success' });
      } else {
        await api.post('/cars', values);
        enqueueSnackbar('Car added successfully', { variant: 'success' });
      }
      onClose(true);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Operation failed', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{car ? 'Edit Car' : 'Add New Car'}</DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={carSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <DialogContent>
              <TextField
                fullWidth
                margin="normal"
                name="vin"
                label="VIN"
                disabled={!!car}
                value={values.vin}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.vin && Boolean(errors.vin)}
                helperText={touched.vin && errors.vin}
              />
              
              <TextField
                fullWidth
                margin="normal"
                name="brand"
                label="Brand"
                value={values.brand}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.brand && Boolean(errors.brand)}
                helperText={touched.brand && errors.brand}
              />

              <TextField
                fullWidth
                margin="normal"
                name="model"
                label="Model"
                value={values.model}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.model && Boolean(errors.model)}
                helperText={touched.model && errors.model}
              />

              <TextField
                fullWidth
                margin="normal"
                name="production_year"
                label="Production Year"
                type="number"
                value={values.production_year}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.production_year && Boolean(errors.production_year)}
                helperText={touched.production_year && errors.production_year}
              />

              <TextField
                fullWidth
                margin="normal"
                select
                name="vehicle_type"
                label="Vehicle Type"
                value={values.vehicle_type}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.vehicle_type && Boolean(errors.vehicle_type)}
                helperText={touched.vehicle_type && errors.vehicle_type}
              >
                <MenuItem value="passenger">Passenger</MenuItem>
                <MenuItem value="truck">Truck</MenuItem>
                <MenuItem value="bus">Bus</MenuItem>
                <MenuItem value="motorcycle">Motorcycle</MenuItem>
              </TextField>

              <TextField
                fullWidth
                margin="normal"
                select
                name="fuel_type"
                label="Fuel Type"
                value={values.fuel_type}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.fuel_type && Boolean(errors.fuel_type)}
                helperText={touched.fuel_type && errors.fuel_type}
              >
                <MenuItem value="petrol">Petrol</MenuItem>
                <MenuItem value="diesel">Diesel</MenuItem>
                <MenuItem value="electric">Electric</MenuItem>
                <MenuItem value="hybrid">Hybrid</MenuItem>
                <MenuItem value="lpg">LPG</MenuItem>
              </TextField>

              <TextField
                fullWidth
                margin="normal"
                name="doors_count"
                label="Number of Doors"
                type="number"
                value={values.doors_count}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.doors_count && Boolean(errors.doors_count)}
                helperText={touched.doors_count && errors.doors_count}
              />
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
                {car ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default CarDialog;
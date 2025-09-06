import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  InputAdornment
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import api from '../services/api.service';

const taskSchema = Yup.object().shape({
  description: Yup.string()
    .required('Task description is required')
    .min(5, 'Description must be at least 5 characters'),
  materials_used: Yup.string(),
  hours_worked: Yup.number()
    .min(0, 'Hours worked cannot be negative')
    .max(24, 'Hours worked cannot exceed 24 per task'),
  cost: Yup.number()
    .required('Cost is required')
    .min(0, 'Cost cannot be negative')
    .max(10000, 'Cost cannot exceed €10,000 per task')
});

const TaskDialog = ({ open, onClose, task, appointmentId }) => {
  const { enqueueSnackbar } = useSnackbar();

  const initialValues = task ? {
    description: task.description || '',
    materials_used: task.materials_used || '',
    hours_worked: task.hours_worked || '',
    cost: task.cost || ''
  } : {
    description: '',
    materials_used: '',
    hours_worked: '',
    cost: ''
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const taskData = {
        ...values,
        appointment_id: appointmentId,
        hours_worked: values.hours_worked ? parseFloat(values.hours_worked) : null,
        cost: parseFloat(values.cost)
      };

      if (task) {
        await api.put(`/tasks/${task.id}`, taskData);
        enqueueSnackbar('Task updated successfully', { variant: 'success' });
      } else {
        await api.post('/tasks', taskData);
        enqueueSnackbar('Task created successfully', { variant: 'success' });
      }
      onClose(true); // true indicates success/refresh needed
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Operation failed';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        {task ? 'Edit Task' : 'Add New Task'}
      </DialogTitle>
      
      <Formik
        initialValues={initialValues}
        validationSchema={taskSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={true}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    name="description"
                    label="Task Description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    placeholder="Describe what work was performed..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    name="materials_used"
                    label="Materials Used (Optional)"
                    value={values.materials_used}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.materials_used && Boolean(errors.materials_used)}
                    helperText={touched.materials_used && errors.materials_used}
                    placeholder="List materials and parts used..."
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="hours_worked"
                    label="Hours Worked (Optional)"
                    type="number"
                    inputProps={{ 
                      min: 0, 
                      max: 24, 
                      step: 0.25
                    }}
                    value={values.hours_worked}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.hours_worked && Boolean(errors.hours_worked)}
                    helperText={touched.hours_worked && errors.hours_worked}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="cost"
                    label="Cost"
                    type="number"
                    inputProps={{ 
                      min: 0, 
                      max: 10000, 
                      step: 0.01
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">€</InputAdornment>
                    }}
                    value={values.cost}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.cost && Boolean(errors.cost)}
                    helperText={touched.cost && errors.cost}
                    required
                  />
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => onClose(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={isSubmitting}
              >
                {task ? 'Update Task' : 'Add Task'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default TaskDialog;

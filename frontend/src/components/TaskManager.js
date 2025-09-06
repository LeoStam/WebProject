import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Box,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useAuth } from '../context/AuthContext';
import api from '../services/api.service';
import TaskDialog from './TaskDialog';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(2)
}));

const StyledTable = styled(Table)(({ theme }) => ({
  minWidth: 650
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2)
}));

const TaskManager = ({ appointment }) => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Check if current user can manage tasks for this appointment
  const canManageTasks = () => {
    if (user?.role === 'secretary') return true;
    if (user?.role === 'mechanic' && appointment?.mechanic_id === user?.id) return true;
    return false;
  };

  // Only show if appointment is in progress and user can manage tasks
  const shouldShowTaskManager = () => {
    return appointment?.status === 'in_progress' && canManageTasks();
  };

  useEffect(() => {
    if (appointment?.id) {
      fetchTasks();
    }
  }, [appointment?.id]);

  const fetchTasks = async () => {
    if (!appointment?.id) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/tasks/appointment/${appointment.id}`);
      setTasks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.response?.status !== 403) { // Don't show error for permission issues
        enqueueSnackbar('Failed to load tasks', { variant: 'error' });
      }
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setDialogOpen(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await api.delete(`/tasks/${taskId}`);
      enqueueSnackbar('Task deleted successfully', { variant: 'success' });
      fetchTasks();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete task';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleDialogClose = (shouldRefresh) => {
    setDialogOpen(false);
    setSelectedTask(null);
    if (shouldRefresh) {
      fetchTasks();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('el-GR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount || 0);
  };

  const getTotalCost = () => {
    return tasks.reduce((sum, task) => sum + (parseFloat(task.cost) || 0), 0);
  };

  const getTotalHours = () => {
    return tasks.reduce((sum, task) => sum + (parseFloat(task.hours_worked) || 0), 0);
  };

  // Don't render anything if user shouldn't see this
  if (!shouldShowTaskManager()) {
    return null;
  }

  if (loading) {
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography>Loading tasks...</Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper sx={{ p: 2, mt: 2 }}>
        <Header>
          <Box>
            <Typography variant="h6">Tasks & Services</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage work performed on this appointment
            </Typography>
          </Box>
          {canManageTasks() && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddTask}
            >
              Add Task
            </Button>
          )}
        </Header>

        {tasks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No tasks have been added yet.
            </Typography>
            {canManageTasks() && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Click "Add Task" to record work performed on this appointment.
              </Typography>
            )}
          </Box>
        ) : (
          <>
            <StyledTableContainer>
              <StyledTable>
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell>Materials Used</TableCell>
                    <TableCell align="right">Hours</TableCell>
                    <TableCell align="right">Cost</TableCell>
                    {canManageTasks() && <TableCell align="center">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Typography variant="body2">
                          {task.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {task.materials_used || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {task.hours_worked ? (
                          <Chip 
                            label={`${task.hours_worked}h`} 
                            size="small" 
                            variant="outlined"
                          />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(task.cost)}
                        </Typography>
                      </TableCell>
                      {canManageTasks() && (
                        <TableCell align="center">
                          <Tooltip title="Edit Task">
                            <IconButton 
                              size="small"
                              onClick={() => handleEditTask(task)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Task">
                            <IconButton 
                              size="small"
                              color="error"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </StyledTable>
            </StyledTableContainer>

            {/* Summary Row */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 4, 
              mt: 2, 
              pt: 2, 
              borderTop: 1, 
              borderColor: 'divider' 
            }}>
              {getTotalHours() > 0 && (
                <Typography variant="body2">
                  <strong>Total Hours: {getTotalHours()}h</strong>
                </Typography>
              )}
              <Typography variant="body1">
                <strong>Total Cost: {formatCurrency(getTotalCost())}</strong>
              </Typography>
            </Box>
          </>
        )}
      </Paper>

      <TaskDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        task={selectedTask}
        appointmentId={appointment?.id}
      />
    </>
  );
};

export default TaskManager;

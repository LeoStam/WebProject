// src/pages/Users/UsersList.js
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Chip,
  makeStyles,
  TextField,
  InputAdornment
} from '@material-ui/core';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Search as SearchIcon
} from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import api from '../../services/api.service';
import UserDialog from './UserDialog';

const useStyles = makeStyles((theme) => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3)
  },
  search: {
    marginBottom: theme.spacing(3),
    width: 300
  },
  table: {
    minWidth: 650,
  },
  active: {
    backgroundColor: theme.palette.success.light,
  },
  inactive: {
    backgroundColor: theme.palette.error.light,
  }
}));

const UsersList = () => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch users', { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${user.id}`);
        enqueueSnackbar('User deleted successfully', { variant: 'success' });
        fetchUsers();
      } catch (error) {
        enqueueSnackbar('Failed to delete user', { variant: 'error' });
      }
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await api.patch(`/users/${user.id}/activate`, {
        is_active: !user.is_active
      });
      enqueueSnackbar(
        `User ${user.is_active ? 'deactivated' : 'activated'} successfully`,
        { variant: 'success' }
      );
      fetchUsers();
    } catch (error) {
      enqueueSnackbar('Failed to update user status', { variant: 'error' });
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className={classes.header}>
        <Typography variant="h5">Users Management</Typography>
      </div>

      <TextField
        className={classes.search}
        variant="outlined"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer component={Paper}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    icon={user.is_active ? <ActiveIcon /> : <InactiveIcon />}
                    label={user.is_active ? 'Active' : 'Inactive'}
                    className={user.is_active ? classes.active : classes.inactive}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleToggleActive(user)}>
                    {user.is_active ? <InactiveIcon /> : <ActiveIcon />}
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <UserDialog
        open={dialogOpen}
        onClose={(refreshList) => {
          setDialogOpen(false);
          setSelectedUser(null);
          if (refreshList) fetchUsers();
        }}
        user={selectedUser}
      />
    </>
  );
};

export default UsersList;
// src/pages/Users/UsersList.js
import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import { useSnackbar } from 'notistack';
import api from '../../services/api.service';
import UserDialog from './UserDialog';

const Header = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3)
}));

const Search = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  width: 300
}));

const TableStyles = styled(Table)(({ theme }) => ({
  minWidth: 650
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor: status === 'active' ? theme.palette.success.light : theme.palette.error.light
}));

const UsersList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchUsers = async (search = '') => {
    try {
      setIsSearching(true);
      const params = search ? { q: search } : {};
      const response = await api.get('/users/search', { params });
      setUsers(response.data);
    } catch (error) {
      // If search fails, fall back to getting all users
      try {
        const response = await api.get('/users');
        setUsers(response.data);
        enqueueSnackbar('Search failed, showing all users', { variant: 'warning' });
      } catch (fallbackError) {
        enqueueSnackbar('Failed to fetch users', { variant: 'error' });
      }
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchUsers(searchTerm.trim());
      } else {
        fetchUsers();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const filteredUsers = users; // No client-side filtering needed since we use backend search

  return (
    <>
      <Header>
        <Typography variant="h5">Users Management</Typography>
      </Header>

      <Search
        variant="outlined"
        placeholder="Search by name, username, email, or AFM..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        disabled={isSearching}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer component={Paper}>
        <TableStyles>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>AFM</TableCell>
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
                  {user.customerProfile?.afm || '-'}
                </TableCell>
                <TableCell>
                  <StatusChip
                    icon={user.is_active ? <CheckCircleIcon /> : <CancelIcon />}
                    label={user.is_active ? 'Active' : 'Inactive'}
                    status={user.is_active ? 'active' : 'inactive'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleToggleActive(user)}>
                    {user.is_active ? <CancelIcon /> : <CheckCircleIcon />}
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableStyles>
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
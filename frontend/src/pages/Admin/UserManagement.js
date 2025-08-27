import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../context/AuthContext';
import UserDialog from '../Users/UserDialog';

const Root = styled('div')(({ theme }) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
}));

const UserManagement = () => {
  const StyledPaper = styled(Paper)(({ theme }) => ({
    width: '100%',
    marginBottom: theme.spacing(2)
  }));

  const Header = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2)
  }));
  const { apiClient } = useAuth();
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setOpenDialog(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiClient.delete(`/api/users/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    fetchUsers();
  };

  return (
    <Root>
      <Header>
        <Typography variant="h5">User Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
        >
          Add User
        </Button>
      </Header>

      <StyledPaper>
        <TableContainer>
          <Table sx={{ minWidth: 750 }}>
            <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.is_active ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditUser(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteUser(user.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </StyledPaper>

      {openDialog && (
        <UserDialog
          open={openDialog}
          onClose={handleCloseDialog}
          user={selectedUser}
        />
      )}
    </Root>
  );
};

export default UserManagement;

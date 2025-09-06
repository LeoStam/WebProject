// src/pages/Cars/CarsList.js
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Typography,
  styled
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api.service';
import CarDialog from './CarDialog';

const Header = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3)
}));

const StyledTable = styled(Table)({
  minWidth: 650,
});

const CarsList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [cars, setCars] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  const fetchCars = async () => {
    try {
      const response = await api.get('/cars');
      setCars(response.data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch cars', { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleAdd = () => {
    setSelectedCar(null);
    setDialogOpen(true);
  };

  const handleEdit = (car) => {
    setSelectedCar(car);
    setDialogOpen(true);
  };

  const handleView = (car) => {
    setSelectedCar(car);
    setDialogOpen(true);
  };

  const handleDelete = async (car) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await api.delete(`/cars/${car.vin}`);
        enqueueSnackbar('Car deleted successfully', { variant: 'success' });
        fetchCars();
      } catch (error) {
        enqueueSnackbar('Failed to delete car', { variant: 'error' });
      }
    }
  };

  const handleDialogClose = (refreshList) => {
    setDialogOpen(false);
    if (refreshList) {
      fetchCars();
    }
  };

  // Permission checks
  const canAdd = () => user?.role === 'customer' || user?.role === 'secretary';
  const canEdit = (car) => {
    if (user?.role === 'secretary') return true;
    if (user?.role === 'customer' && car?.owner?.id === user?.id) return true;
    return false;
  };
  const canDelete = (car) => {
    if (user?.role === 'secretary') return true;
    if (user?.role === 'customer' && car?.owner?.id === user?.id) return true;
    return false;
  };

  return (
    <>
      <Header>
        <Typography variant="h5">Cars</Typography>
        {canAdd() && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add Car
          </Button>
        )}
      </Header>

      <TableContainer component={Paper}>
        <StyledTable>
          <TableHead>
            <TableRow>
              <TableCell>VIN</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cars.map((car) => (
              <TableRow key={car.vin}>
                <TableCell>{car.vin}</TableCell>
                <TableCell>{car.brand}</TableCell>
                <TableCell>{car.model}</TableCell>
                <TableCell>{car.production_year}</TableCell>
                <TableCell>{car.vehicle_type}</TableCell>
                <TableCell>
                  {/* Mechanics can only view, others can edit if they have permission */}
                  {user?.role === 'mechanic' ? (
                    <IconButton 
                      onClick={() => handleView(car)}
                      title="View Details"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  ) : canEdit(car) && (
                    <IconButton 
                      onClick={() => handleEdit(car)}
                      title="Edit Car"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  
                  {canDelete(car) && (
                    <IconButton 
                      onClick={() => handleDelete(car)}
                      title="Delete Car"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </StyledTable>
      </TableContainer>

      <CarDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        car={selectedCar}
      />
    </>
  );
};

export default CarsList;
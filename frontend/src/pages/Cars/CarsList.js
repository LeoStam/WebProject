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
  makeStyles
} from '@material-ui/core';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import api from '../../services/api.service';
import CarDialog from './CarDialog';

const useStyles = makeStyles((theme) => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3)
  },
  table: {
    minWidth: 650,
  }
}));

const CarsList = () => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
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

  return (
    <>
      <div className={classes.header}>
        <Typography variant="h5">Cars</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Car
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table className={classes.table}>
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
                  <IconButton onClick={() => handleEdit(car)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(car)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
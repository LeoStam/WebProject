import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box, Paper, styled } from '@mui/material';

const HeroSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 0, 6),
  backgroundColor: theme.palette.background.paper,
}));

const ButtonContainer = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(4),
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(2)
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 4),
}));

const ServicesPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(4),
}));

const ServicesContainer = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(2),
  '& > *': {
    marginBottom: theme.spacing(1),
  }
}));

const Landing = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <HeroSection>
        <Typography 
          component="h1" 
          variant="h2" 
          align="center" 
          color="textPrimary" 
          gutterBottom
        >
          Car Garage Management System
        </Typography>
        <Typography 
          variant="h5" 
          align="center" 
          color="textSecondary" 
          paragraph
        >
          Professional Vehicle Maintenance & Repair Services
        </Typography>
        <ButtonContainer>
          <StyledButton
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
          >
            Login
          </StyledButton>
          <StyledButton
            variant="outlined"
            color="primary"
            onClick={() => navigate('/register')}
          >
            Register
          </StyledButton>
        </ButtonContainer>
      </HeroSection>
      
      <ServicesPaper>
        <Typography variant="h6" gutterBottom>
          Our Services
        </Typography>
        <ServicesContainer>
          <Typography variant="body1">
            • Professional Vehicle Maintenance
          </Typography>
          <Typography variant="body1">
            • Expert Mechanical Repairs
          </Typography>
          <Typography variant="body1">
            • Online Appointment Booking
          </Typography>
          <Typography variant="body1">
            • Real-time Service Tracking
          </Typography>
        </ServicesContainer>
      </ServicesPaper>
    </Container>
  );
};

export default Landing;
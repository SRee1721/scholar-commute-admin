import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Button,
  styled,
} from '@mui/material';
import {
  DirectionsBus,
  People,
  Schedule,
  Notifications,
  Settings,
  Assessment,
  Logout,
  LocationOn,
  PersonAdd,
  Route,
} from '@mui/icons-material';

const FeatureCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(3),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#fff',
  aspectRatio: '1 / 1',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& svg': {
    fontSize: 48,
    color: theme.palette.primary.main,
  },
}));

const features = [
  {
    title: 'Live Tracking',
    icon: LocationOn,
    path: '/live-tracking',
    shortDesc: 'Track buses in real-time',
  },
  {
    title: 'Register Students',
    icon: PersonAdd,
    path: '/register-students',
    shortDesc: 'Add and manage students',
  },
  {
    title: 'Default Routes',
    icon: Route,
    path: '/default-routes',
    shortDesc: 'View and manage default bus routes',
  },
  {
    title: 'Notifications',
    icon: Notifications,
    path: '/notifications',
    shortDesc: 'Send alerts and updates',
  },
  {
    title: 'Reports',
    icon: Assessment,
    path: '/reports',
    shortDesc: 'View analytics and reports',
  },
  {
    title: 'Bus Management',
    icon: DirectionsBus,
    path: '/bus-management',
    shortDesc: 'Manage bus details and assignments',
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    setEmail(storedEmail || 'Admin');

    const interval = setInterval(() => {
      const expiry = localStorage.getItem('sessionExpiry');
      if (!expiry || new Date().getTime() > parseInt(expiry)) {
        handleLogout();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [handleLogout]);

  const handleFeatureClick = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Scholar Commute Admin
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              {email}
            </Typography>
            <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 500,
            color: 'text.primary',
            mb: 4,
            textAlign: 'center',
          }}
        >
          Welcome to Admin Dashboard
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {features.map((feature) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={feature.title}
              sx={{ display: 'flex', justifyContent: 'center' }}
            >
              <FeatureCard
                onClick={() => handleFeatureClick(feature.path)}
                sx={{
                  width: 200,
                  height: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconWrapper>
                  <feature.icon />
                </IconWrapper>
                <Typography
                  variant="h6"
                  sx={{ mb: 1, fontWeight: 500, color: 'text.primary' }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', textAlign: 'center' }}
                >
                  {feature.shortDesc}
                </Typography>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;

import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Chip,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RouteIcon from '@mui/icons-material/Route';

// Custom marker icons for Leaflet
const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/61/61231.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});
const selectedBusIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/61/61231.png',
  iconSize: [35, 35],
  iconAnchor: [17.5, 35],
  popupAnchor: [0, -35],
  className: 'selected-bus-icon',
});
const stopIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

const defaultCenter = [12.83714, 80.05204];

function MapBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

function LiveTracking() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [busStops, setBusStops] = useState([]);
  const [loadingStops, setLoadingStops] = useState(false);
  const [stopLocations, setStopLocations] = useState([]);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapBounds, setMapBounds] = useState(null);

  // Fetch buses data from backend
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/buses');
        const busList = await response.json();
        setBuses(busList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching buses:', err);
        setError('Failed to fetch bus data');
        setLoading(false);
      }
    };
    fetchBuses();
  }, []);

  // Calculate bounds to fit all markers
  const calculateBounds = useCallback((locations) => {
    if (locations.length === 0) return null;
    const bounds = L.latLngBounds(locations.map(loc => loc.position));
    return bounds;
  }, []);

  const normalize = str => str.trim().toLowerCase();

  const handleBusClick = async (bus) => {
    setSelectedBus(bus);
    setLoadingStops(true);
    try {
      if (bus.current_route_no) {
        // Fetch route data from backend
        const routeRes = await fetch(`http://localhost:5000/api/routes/${bus.current_route_no}`);
        if (!routeRes.ok) throw new Error('Route not found');
        const routeData = await routeRes.json();
        setBusStops(routeData.stops || []);
        // Fetch all stop coordinates for this route
        const coordsRes = await fetch(`http://localhost:5000/api/routes/${bus.current_route_no}/stop-coords`);
        const stopsWithCoords = await coordsRes.json();
        // Only plot stops with valid lat/lng
        const locations = stopsWithCoords.filter(s => s.lat && s.lng).map(s => ({
          name: s.name,
          position: [s.lat, s.lng]
        }));
        setStopLocations(locations);
        // Debug logging
        console.log('Route stops:', routeData.stops);
        console.log('Stop locations:', locations);
        // Add bus location to bounds calculation
        const boundsLocations = [...locations];
        if (bus.current_location) {
          boundsLocations.push({
            name: `Bus ${bus.bus_no}`,
            position: [bus.current_location.latitude, bus.current_location.longitude]
          });
        }
        // Calculate and set bounds
        const bounds = calculateBounds(boundsLocations);
        setMapBounds(bounds);
        // Set initial center to bus location or first stop
        if (bus.current_location) {
          setMapCenter([bus.current_location.latitude, bus.current_location.longitude]);
        } else if (locations.length > 0) {
          setMapCenter(locations[0].position);
        }
      } else {
        setBusStops([]);
        setStopLocations([]);
        setMapBounds(null);
      }
    } catch (err) {
      console.error('Error fetching stops:', err);
      setBusStops([]);
      setStopLocations([]);
      setMapBounds(null);
    } finally {
      setLoadingStops(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: 'calc(100vh - 64px)', 
      display: 'flex', 
      flexDirection: 'row',
      gap: 2,
      p: 2
    }}>
      {/* Left Section - Bus List (25%) */}
      <Box sx={{ 
        width: '25%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        <Card sx={{ flex: 1, overflow: 'auto' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Buses
            </Typography>
            <List>
              {buses.map((bus, index) => (
                <React.Fragment key={bus.id}>
                  <ListItem 
                    button
                    onClick={() => handleBusClick(bus)}
                    selected={bus.id === selectedBus?.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DirectionsBusIcon color="primary" />
                          <Typography variant="subtitle1" fontWeight="medium">
                            Bus {bus.bus_no}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            Route: {bus.current_route_no || 'Not assigned'}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2" color="text.secondary">
                            Status: {bus.status || 'Active'}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < buses.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>

      {/* Center Section - Leaflet Map (50%) */}
      <Box sx={{ width: '50%', height: '100%' }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ height: '100%', p: 0, '&:last-child': { pb: 0 } }}>
            <MapContainer
              center={mapCenter}
              zoom={12}
              style={{ width: '100%', height: '100%', minHeight: '500px' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapBounds && <MapBounds bounds={mapBounds} />}
              {/* Draw route line */}
              {stopLocations.length > 1 && (
                <Polyline
                  positions={stopLocations.map(loc => loc.position)}
                  pathOptions={{ color: '#0d6efd', weight: 5, opacity: 0.8 }}
                />
              )}
              {/* Bus markers */}
              {buses.map((bus) => (
                <Marker
                  key={bus.id}
                  position={
                    bus.current_location
                      ? [bus.current_location.latitude, bus.current_location.longitude]
                      : defaultCenter
                  }
                  icon={bus.id === selectedBus?.id ? selectedBusIcon : busIcon}
                  eventHandlers={{
                    click: () => handleBusClick(bus),
                  }}
                >
                  <Popup>
                    <Typography variant="subtitle2">Bus {bus.bus_no}</Typography>
                    <Typography variant="body2">Route: {bus.current_route_no || 'Not assigned'}</Typography>
                    <Typography variant="body2">Status: {bus.status || 'Active'}</Typography>
                  </Popup>
                </Marker>
              ))}
              {/* Stop markers */}
              {stopLocations.map((stop, index) => (
                <Marker
                  key={index}
                  position={stop.position}
                  icon={stopIcon}
                >
                  <Popup>
                    <Typography variant="body2">{index + 1}. {stop.name}</Typography>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Right Section - Bus Details (25%) */}
      <Box sx={{ 
        width: '25%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {selectedBus ? (
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <RouteIcon color="primary" />
                <Typography variant="h6">
                  Bus {selectedBus.bus_no} Details
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Current Route: {selectedBus.current_route_no || 'Not assigned'}
                </Typography>
                <Chip 
                  label={selectedBus.status || 'Active'} 
                  color={selectedBus.status === 'Active' ? 'success' : 'default'}
                  size="small"
                />
              </Box>

              <Typography variant="h6" gutterBottom>
                Bus Stops
              </Typography>
              
              {loadingStops ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : busStops.length > 0 ? (
                <List>
                  {busStops.map((stop, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationOnIcon color="error" fontSize="small" />
                              <Typography variant="body1" fontWeight="medium">
                                {index + 1}. {stop}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < busStops.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No stops available for this route
                </Typography>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent>
              <Typography variant="body1" color="text.secondary" align="center">
                Select a bus to view details
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}

export default LiveTracking; 
import React, { useEffect, useState } from 'react';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../firebase/config';

const DefaultRoutes = () => {
  const [buses, setBuses] = useState([]);
  const [routesMap, setRoutesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch buses and routes from backend
        const busesRes = await fetch('http://localhost:5000/api/buses');
        const busesData = await busesRes.json();
        const routesRes = await fetch('http://localhost:5000/api/routes');
        const routesArr = await routesRes.json();
        const routesData = {};
        routesArr.forEach((route) => {
          routesData[route.id] = route;
        });

        let busList = [];
        busesData.forEach((busData) => {
          const route = routesData[busData.current_route_no];
          busList.push({
            busNo: busData.bus_no,
            stops: route?.stops || []
          });
        });

        const naturalSort = (a, b) => a.busNo.localeCompare(b.busNo, undefined, { numeric: true, sensitivity: 'base' });
        busList.sort(naturalSort);

        setBuses(busList);
        setRoutesMap(routesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredBuses = buses.filter(bus => bus.busNo.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', fontSize: '1.5rem', color: '#333' }}>
        Loading bus routes...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f5f9ff', minHeight: '100vh' }}>
      
      {/* Header Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ color: '#0d6efd', fontSize: '2rem', margin: 0 }}>🚌 Bus Routes</h2>
        <input
          type="text"
          placeholder="🔍 Search by Bus Number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '0.8rem 1rem',
            width: '100%',
            maxWidth: '350px',
            borderRadius: '8px',
            border: '1px solid #ced4da',
            fontSize: '1rem',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
            transition: '0.3s border ease, 0.3s box-shadow ease',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.border = '1px solid #0d6efd'}
          onBlur={(e) => e.target.style.border = '1px solid #ced4da'}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr style={theadRowStyle}>
              <th style={thStyle}>Bus Number</th>
              <th style={thStyle}>Stops</th>
            </tr>
          </thead>
          <tbody>
            {filteredBuses.length > 0 ? (
              filteredBuses.map((bus, index) => (
                <tr
                  key={index}
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    ...rowStyle,
                    backgroundColor: hovered === index ? '#e0f0ff' : index % 2 === 0 ? '#ffffff' : '#f0f8ff',
                  }}
                >
                  <td style={{ ...tdStyle, fontWeight: 'bold', textAlign: 'center' }}>{bus.busNo}</td>
                  <td style={{ ...tdStyle, fontWeight: '500' }}>
                    {bus.stops.length > 0
                      ? bus.stops.join(' / ')
                      : <span style={{ fontStyle: 'italic', color: '#888' }}>No stops available</span>}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" style={{ textAlign: 'center', padding: '1rem', color: '#888' }}>No matching buses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Styles
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  overflow: 'hidden',
  border: '1px solid #d1e3f0'
};

const theadRowStyle = {
  backgroundColor: '#0d6efd',
  color: 'white',
};

const thStyle = {
  padding: '1rem',
  border: '1px solid #cbd9ea',
  fontSize: '1.1rem',
  textAlign: 'center'
};

const tdStyle = {
  padding: '1rem',
  border: '1px solid #cbd9ea',
  fontSize: '1rem',
  color: '#333',
  verticalAlign: 'middle'
};

const rowStyle = {
  transition: 'background 0.3s ease',
};

export default DefaultRoutes; 
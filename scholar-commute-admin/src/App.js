import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DefaultRoutes from "./pages/DefaultRoutes";
import BusManagement from "./pages/BusManagement";
import LiveTracking from "./pages/LiveTracking";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import EditBus from "./pages/EditBus";
// import Analytics from "./pages/Analytics";
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/default-routes"
            element={
              <ProtectedRoute>
                <DefaultRoutes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/live-tracking"
            element={
              <ProtectedRoute>
                <LiveTracking />
              </ProtectedRoute>
            }
          />
         <Route
            path="/register-students"
            element={
              <ProtectedRoute>
                <a href="https://face-collector-app.onrender.com">
                  Register Students
                </a>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <div>Notifications Page (Coming Soon)</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <div>Reports Page (Coming Soon)</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bus-management"
            element={
              <ProtectedRoute>
                <BusManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bus-management/edit/:busId"
            element={
              <ProtectedRoute>
                <EditBus />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

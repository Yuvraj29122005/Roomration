import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { DataProvider } from './contexts/DataContext';
import ToastContainer from './components/common/Toast';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import UserLayout from './components/layout/UserLayout';

// Auth
import LoginPage from './pages/auth/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Members from './pages/admin/Members';
import Dishes from './pages/admin/Dishes';

import DailyMealEntry from './pages/admin/DailyMealEntry';
import MonthlyReport from './pages/admin/MonthlyReport';
import AdminSettings from './pages/admin/Settings';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import MealHistory from './pages/user/MealHistory';
import MonthlySummary from './pages/user/MonthlySummary';
import Profile from './pages/user/Profile';

function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />;
  }
  return children;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Login */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace /> : <LoginPage />}
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="members" element={<Members />} />
        <Route path="dishes" element={<Dishes />} />

        <Route path="daily-meals" element={<DailyMealEntry />} />
        <Route path="reports" element={<MonthlyReport />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* User Routes */}
      <Route
        path="/user"
        element={
          <ProtectedRoute requiredRole="user">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="meals" element={<MealHistory />} />
        <Route path="summary" element={<MonthlySummary />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <DataProvider>
            <AuthProvider>
              <AppRoutes />
              <ToastContainer />
            </AuthProvider>
          </DataProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

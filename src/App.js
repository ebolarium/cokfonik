import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';
import Login from './components/Login';
import MasterAdminDashboard from './components/MasterAdminDashboard';
import ManagementDashboard from './components/ManagementDashboard';
import UserDashboard from './components/UserDashboard';
// import ConductorDashboard from './components/ConductorDashboard'; // Şef için
import MyAttendance from './components/MyAttendance';
import MyFees from './components/MyFees';
import CalendarView from './components/CalendarView';
import CustomAppBar from './components/AppBar';
import BottomNav from './components/BottomNav'; // Alt Menü

const App = () => {
  const location = useLocation(); // URL değişikliklerini izlemek için
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');

  // Oturum kontrolü ve yönlendirme
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
      setIsLoggedIn(false);
      if (location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else {
      setIsLoggedIn(true);
      setUserRole(user.role); // Kullanıcı rolünü ayarla
    }
    setLoading(false); // Yükleme durumunu kapat
  }, [location]);

  // AppBar ve Alt Menü gösterme kontrolü
  const excludedPaths = ['/login', '/loading']; // Belirli yollar için gizlenecek
  const showAppBar = !excludedPaths.includes(location.pathname);
  const showBottomNav = !excludedPaths.includes(location.pathname);

  // Rol bazlı yönlendirme
  const getDashboardByRole = () => {
    switch (userRole) {
      case 'Master Admin':
        return <Navigate to="/master-admin-dashboard" />;
      case 'Yönetim Kurulu':
        return <Navigate to="/management-dashboard" />;
     // case 'Şef':
       // return <Navigate to="/conductor-dashboard" />;
      case 'Korist':
        return <Navigate to="/user-dashboard" />;
      default:
        return <Navigate to="/login" />;
    }
  };

  return (
    <div>
      {loading ? (
        <LoadingScreen />
      ) : isLoggedIn ? (
        <>
          {showAppBar && <CustomAppBar userName={JSON.parse(localStorage.getItem('user'))?.name} />}
          <Routes>
            <Route path="/master-admin-dashboard" element={<MasterAdminDashboard />} />
            <Route path="/management-dashboard" element={<ManagementDashboard />} />
            {/*  <Route path="/conductor-dashboard" element={<ConductorDashboard />} /> Şef Sayfası */}
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/my-attendance" element={<MyAttendance />} />
            <Route path="/my-fees" element={<MyFees />} />
            <Route path="/calendar-view" element={<CalendarView />} />
            <Route path="*" element={getDashboardByRole()} /> {/* Rol bazlı yönlendirme */}
          </Routes>
          {showBottomNav && <BottomNav />}
        </>
      ) : (
        <Login onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
};

// Router ile sarılmış ana bileşen
const AppWithRouter = () => (
  <Router>
    <Routes>
      <Route path="/*" element={<App />} />
    </Routes>
  </Router>
);

export default AppWithRouter;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';
import Login from './components/Login';
import MasterAdminDashboard from './components/MasterAdminDashboard';
import UserManagement from './components/UserManagement';
import FeeManagement from './components/FeeManagement';
import AttendanceManagement from './components/AttendanceManagement';
import CalendarManagement from './components/CalendarManagement';
import ManagementDashboard from './components/ManagementDashboard';
import UserDashboard from './components/UserDashboard';
import MyAttendance from './components/MyAttendance';
import MyFees from './components/MyFees';
import CalendarView from './components/CalendarView';
import CustomAppBar from './components/AppBar';
import BottomNav from './components/BottomNav'; // Yeni Alt Menü

const App = () => {
  const location = useLocation(); // URL değişikliklerini izlemek için
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    }
    setLoading(false); // Yükleme durumunu kapat
  }, [location]);

  // AppBar ve Alt Menü gösterme kontrolü
  const excludedPaths = ['/login', '/loading']; // Belirli yollar için gizlenecek
  const showAppBar = !excludedPaths.includes(location.pathname);
  const showBottomNav = !excludedPaths.includes(location.pathname);

  return (
    <div>
      {loading ? (
        <LoadingScreen />
      ) : isLoggedIn ? (
        <>
          {showAppBar && <CustomAppBar userName={JSON.parse(localStorage.getItem('user'))?.name} />}
          <Routes>
            <Route path="/users" element={<UserManagement />} />
            <Route path="/fees" element={<FeeManagement />} />
            <Route path="/attendance" element={<AttendanceManagement />} />
            <Route path="/calendar" element={<CalendarManagement />} />
            <Route path="/" element={<Login />} />
            <Route path="/master-admin-dashboard" element={<MasterAdminDashboard />} />
            <Route path="/management-dashboard" element={<ManagementDashboard />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/my-attendance" element={<MyAttendance />} />
            <Route path="/my-fees" element={<MyFees />} />
            <Route path="/calendar-view" element={<CalendarView />} />
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

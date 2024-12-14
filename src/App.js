import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';
import Login from './components/Login';
import MasterAdminDashboard from './components/MasterAdminDashboard';
import ManagementDashboard from './components/ManagementDashboard';
import UserDashboard from './components/UserDashboard';
import MyAttendance from './components/MyAttendance';
import MyFees from './components/MyFees';
import CalendarView from './components/CalendarView';
import CustomAppBar from './components/AppBar';
import BottomNav from './components/BottomNav'; // Alt Menü
import UserManagement from './components/UserManagement';
import AttendanceManagement from './components/AttendanceManagement';
import CalendarManagement from './components/CalendarManagement';
import FeeManagement from './components/FeeManagement';
import Profile from './components/Profile';


const App = () => {
  const location = useLocation(); // URL değişikliklerini izlemek için
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(''); // Kullanıcı rolü
  const [viewMode, setViewMode] = useState('korist'); // Başlangıçta korist görünümü

  const [showLoadingOnStart, setShowLoadingOnStart] = useState(true);


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

        // Yalnızca girişte gösterilecek
        if (showLoadingOnStart) {
          const timer = setTimeout(() => {
            setLoading(false);
            setShowLoadingOnStart(false); // Tekrar loading göstermesin
          }, 4000);
    
          return () => clearTimeout(timer);
        } else {
          setLoading(false); // Sonraki sayfalarda loading'i kapat
        }
      }, [location, navigate, showLoadingOnStart]);


  // Switch işlemi sırasında uygun dashboard'a yönlendirme
  const handleSwitchView = () => {
    if (viewMode === 'korist') {
      setViewMode('admin');
      if (userRole === 'Master Admin') {
        navigate('/master-admin-dashboard');
      } else if (userRole === 'Yönetim Kurulu') {
        navigate('/management-dashboard');
      }
    } else {
      setViewMode('korist');
      navigate('/user-dashboard');
    }
  };

  // AppBar ve Alt Menü gösterme kontrolü
  const excludedPaths = ['/login', '/loading']; // Belirli yollar için gizlenecek
  const showAppBar = !excludedPaths.includes(location.pathname);
  const showBottomNav = !excludedPaths.includes(location.pathname);

  // Rol bazlı yönlendirme (dashboard'lar arasında geçiş)
  const renderRoutes = () => {
    if (viewMode === 'korist') {
      return (
        <>
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/my-attendance" element={<MyAttendance />} />
          <Route path="/my-fees" element={<MyFees />} />
          <Route path="/calendar-view" element={<CalendarView />} />
          <Route path="/profile" element={<Profile />} />
        </>
      );
    } else if (userRole === 'Master Admin') {
      return (
        <>
          <Route path="/master-admin-dashboard" element={<MasterAdminDashboard />} />
          <Route path="/attendance-management" element={<AttendanceManagement />} />
          <Route path="/calendar-management" element={<CalendarManagement />} />
          <Route path="/fee-management" element={<FeeManagement />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/profile" element={<Profile />} />
        </>
      );
    } else if (userRole === 'Yönetim Kurulu') {
      return (
        <>
          <Route path="/management-dashboard" element={<ManagementDashboard />} />
          <Route path="/attendance-management" element={<AttendanceManagement />} />
          <Route path="/calendar-management" element={<CalendarManagement />} />
          <Route path="/fee-management" element={<FeeManagement />} />
          <Route path="/profile" element={<Profile />} />
        </>
      );
    }
  };

  return (
    <div>
      {loading ? (
        <LoadingScreen />
      ) : isLoggedIn ? (
        <>
          {showAppBar && (
            <CustomAppBar
              userName={JSON.parse(localStorage.getItem('user'))?.name}
              onSwitchView={handleSwitchView} // Switch butonu
              viewMode={viewMode}
            />
          )}
          <Routes>
            {renderRoutes()}
            <Route path="*" element={<Navigate to={viewMode === 'korist' ? '/user-dashboard' : userRole === 'Master Admin' ? '/master-admin-dashboard' : '/management-dashboard'} />} />
          </Routes>
          {showBottomNav && <BottomNav role={userRole} viewMode={viewMode} onSwitchView={handleSwitchView} />}
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

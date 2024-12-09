import React from 'react';
import logo from '../assets/Cokfonik_Logo_Siyah.png';

const LoadingScreen = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#FFFFFF' }}>
      <img src={logo} alt="Çokfonik Logo" style={{ width: '200px', marginBottom: '20px' }} />
      <div>Uygulama Yükleniyor...</div>
    </div>
  );
};

export default LoadingScreen;

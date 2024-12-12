import React from 'react';
import Lottie from 'react-lottie';
import animationData from '../assets/Loading_Animation.json'; // Lottie animasyon dosyası

const LoadingScreen = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#FFFFFF' }}>
      <Lottie options={defaultOptions} height={200} width={200} />
      <div>Yükleniyor...</div>
    </div>
  );
};

export default LoadingScreen;

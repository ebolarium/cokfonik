import React, { useState, useRef } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';

import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import OsmdAudioPlayer from 'osmd-audio-player';

const MidiPlayer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [osmd, setOsmd] = useState(null);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const musicContainerRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const xmlData = e.target.result;

      // OSMD örneği oluştur
      const newOsmd = new OpenSheetMusicDisplay(musicContainerRef.current, {
        autoResize: true,
        backend: 'svg',
        drawTitle: true,
      });
      await newOsmd.load(xmlData);
      await newOsmd.render();

      // Audio player oluştur
      const newAudioPlayer = new OsmdAudioPlayer();
      
      // Audio Player'ı piyano sesi için yapılandır
      newAudioPlayer.soundFontName = 'acoustic_grand_piano';
      newAudioPlayer.options = {
        bpm: 120, // Tempo ayarı
        volume: 1.0, // Ses seviyesi
        instrument: 'acoustic_grand_piano' // Piyano sesi
      };

      // OSMD notalarını yükle
      await newAudioPlayer.loadScore(newOsmd);

      setOsmd(newOsmd);
      setAudioPlayer(newAudioPlayer);
      
      // Debug için log
      console.log('Audio Player yüklendi:', newAudioPlayer);
    };
    reader.readAsText(file);
  };

  const handlePlay = () => {
    if (audioPlayer) {
      audioPlayer.play();
    }
  };

  const handlePause = () => {
    if (audioPlayer) {
      audioPlayer.pause();
    }
  };

  const handleStop = () => {
    if (audioPlayer) {
      audioPlayer.stop();
    }
  };

  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Piano Player
      </Typography>
      <Typography variant="body1" gutterBottom>
        Lütfen bir MusicXML dosyası seçin ve piyano çalmaya başlayın.
      </Typography>

      <Button variant="contained" component="label" sx={{ mb: 2 }}>
        Dosya Seç
        <input
          type="file"
          hidden
          accept=".xml,.musicxml"
          onChange={handleFileChange}
        />
      </Button>

      {selectedFile && (
        <Typography variant="body2" color="textSecondary">
          Seçilen dosya: {selectedFile.name}
        </Typography>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <IconButton 
          color="primary" 
          onClick={handlePlay}
          disabled={!audioPlayer}
        >
          <PlayArrowIcon sx={{ fontSize: 40 }} />
        </IconButton>
        <IconButton 
          color="secondary" 
          onClick={handlePause}
          disabled={!audioPlayer}
        >
          <PauseIcon sx={{ fontSize: 40 }} />
        </IconButton>
        <IconButton 
          color="error" 
          onClick={handleStop}
          disabled={!audioPlayer}
        >
          <StopIcon sx={{ fontSize: 40 }} />
        </IconButton>
      </Box>

      <Box ref={musicContainerRef} sx={{ mt: 3, textAlign: 'left' }} />
    </Box>
  );
};

export default MidiPlayer;
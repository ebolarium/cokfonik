import React, { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  IconButton, 
  Select, 
  MenuItem, 
  FormControl,
  InputLabel,
  Slider,
  Paper
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  SkipPrevious,
  SkipNext,
  PictureAsPdf
} from '@mui/icons-material';

const MusicPlayer = () => {
  const [currentPart, setCurrentPart] = useState('soprano');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const parts = [
    { id: 'soprano', name: 'Soprano', audioUrl: '', pdfUrl: '' },
    { id: 'alto', name: 'Alto', audioUrl: '', pdfUrl: '' },
    { id: 'tenor', name: 'Tenor', audioUrl: '', pdfUrl: '' },
    { id: 'bass', name: 'Bas', audioUrl: '', pdfUrl: '' },
  ];

  const handlePartChange = (event) => {
    setCurrentPart(event.target.value);
    // Burada seçilen part'ın ses dosyasını yükleyebilirsiniz
  };

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSliderChange = (event, newValue) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newValue;
      setCurrentTime(newValue);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 2 }}>
      <Typography variant="h6" gutterBottom align="center">
        Parça Adı
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Part Seçin</InputLabel>
        <Select
          value={currentPart}
          onChange={handlePartChange}
          label="Part Seçin"
        >
          {parts.map(part => (
            <MenuItem key={part.id} value={part.id}>
              {part.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
      />

      <Box sx={{ mb: 2 }}>
        <Slider
          value={currentTime}
          max={duration}
          onChange={handleSliderChange}
          aria-label="time-indicator"
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2">{formatTime(currentTime)}</Typography>
          <Typography variant="body2">{formatTime(duration)}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <IconButton size="large">
          <SkipPrevious />
        </IconButton>
        {!isPlaying ? (
          <IconButton size="large" onClick={handlePlay}>
            <PlayArrow />
          </IconButton>
        ) : (
          <IconButton size="large" onClick={handlePause}>
            <Pause />
          </IconButton>
        )}
        <IconButton size="large" onClick={handleStop}>
          <Stop />
        </IconButton>
        <IconButton size="large">
          <SkipNext />
        </IconButton>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<PictureAsPdf />}
          onClick={() => window.open(parts.find(p => p.id === currentPart)?.pdfUrl)}
        >
          Notaları Görüntüle
        </Button>
      </Box>
    </Paper>
  );
};

export default MusicPlayer;
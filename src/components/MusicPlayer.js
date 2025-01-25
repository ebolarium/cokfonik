import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { Box, Typography, CircularProgress, IconButton, Slider, Button } from '@mui/material';
import { PlayArrow, Pause, Stop, VolumeUp } from '@mui/icons-material';
import Soundfont from 'soundfont-player';

const MusicPlayer = () => {
  const divRef = useRef(null);
  const osmdRef = useRef(null);
  const playerRef = useRef(null);
  const scoreNotesRef = useRef([]);
  const currentNoteIndexRef = useRef(0);
  const playbackTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [tempo, setTempo] = useState(120);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [currentNote, setCurrentNote] = useState('');

  const parseXML = async (xmlText) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const notes = [];
    
    // MusicXML'den nota bilgilerini çıkar
    const noteTags = xmlDoc.getElementsByTagName('note');
    console.log('Bulunan nota sayısı:', noteTags.length);
    
    let currentMeasure = 1;
    
    for (let i = 0; i < noteTags.length; i++) {
      const noteElement = noteTags[i];
      
      // Ölçü değişikliğini kontrol et
      const measureElement = noteElement.closest('measure');
      if (measureElement) {
        const measureNumber = measureElement.getAttribute('number');
        if (measureNumber) {
          currentMeasure = parseInt(measureNumber);
        }
      }
      
      // Nota bilgilerini al
      const stepElement = noteElement.getElementsByTagName('step')[0];
      const octaveElement = noteElement.getElementsByTagName('octave')[0];
      const typeElement = noteElement.getElementsByTagName('type')[0];
      const restElement = noteElement.getElementsByTagName('rest')[0];
      
      if (restElement) {
        // Sus işareti
        const duration = typeElement ? typeElement.textContent : 'quarter';
        notes.push({
          isRest: true,
          duration: duration,
          measureNumber: currentMeasure
        });
      } else if (stepElement && octaveElement) {
        // Normal nota
        const step = stepElement.textContent;
        const octave = parseInt(octaveElement.textContent);
        const duration = typeElement ? typeElement.textContent : 'quarter';
        
        notes.push({
          pitch: `${step}${octave}`,
          duration: duration,
          measureNumber: currentMeasure,
          isRest: false
        });
      }
    }
    
    console.log('Toplam nota sayısı:', notes.length);
    return notes;
  };

  useEffect(() => {
    const loadScore = async () => {
      try {
        console.log('OSMD başlatılıyor...');
        const osmd = new OpenSheetMusicDisplay(divRef.current);
        osmd.setOptions({
          autoResize: true,
          drawTitle: true,
          drawSubtitle: true,
          drawComposer: true,
        });
        osmdRef.current = osmd;

        console.log('Nota dosyası yükleniyor...');
        const response = await fetch('/Deriko_Soprano.musicxml');
        const xmlText = await response.text();
        console.log('Nota dosyası okundu');

        // MusicXML'i parse et ve notaları kaydet
        const notes = await parseXML(xmlText);
        console.log('Notalar parse edildi:', notes);
        scoreNotesRef.current = notes;

        // OSMD ile notaları görüntüle
        await osmd.load(xmlText);
        console.log('OSMD notaları yüklendi');
        
        osmd.render();
        console.log('OSMD render tamamlandı');
        
        setLoading(false);
      } catch (error) {
        console.error('Hata:', error);
        setLoading(false);
      }
    };

    if (divRef.current) {
      loadScore();
    }

    return () => {
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, []);

  const initializeAudio = async () => {
    try {
      // AudioContext oluştur
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      // Piyano sesini yükle
      console.log('Piyano sesi yükleniyor...');
      const player = await Soundfont.instrument(audioContext, 'acoustic_grand_piano', {
        soundfont: 'MusyngKite'
      });
      console.log('Piyano sesi yüklendi');
      
      // Test sesi çal
      await player.play('C4', 0, { duration: 0.5, gain: volume });
      console.log('Test sesi çalındı');
      
      playerRef.current = player;
      setAudioInitialized(true);
    } catch (error) {
      console.error('Ses sistemi başlatılamadı:', error);
    }
  };

  const playNote = async (note) => {
    console.log('playNote çağrıldı:', note);
    if (playerRef.current && note && !note.isRest) {
      try {
        console.log('Nota çalınıyor:', {
          pitch: note.pitch,
          duration: note.duration,
          measure: note.measureNumber,
          player: !!playerRef.current
        });
        setCurrentNote(`${note.pitch} (Ölçü: ${note.measureNumber})`);
        
        // Nota süresini saniyeye çevir
        const durationMap = {
          'whole': 4,
          'half': 2,
          'quarter': 1,
          'eighth': 0.5,
          '16th': 0.25,
          '32nd': 0.125
        };
        
        const durationInSeconds = durationMap[note.duration] || 1;
        console.log('Çalma parametreleri:', {
          pitch: note.pitch,
          durationInSeconds,
          gain: volume
        });
        
        await playerRef.current.play(note.pitch, 0, {
          duration: durationInSeconds,
          gain: volume
        });
        console.log('Nota başarıyla çalındı');
      } catch (error) {
        console.error('Nota çalma hatası:', error);
      }
    } else if (note.isRest) {
      console.log('Sus bekleniyor:', note.duration);
      const durationMap = {
        'whole': 4,
        'half': 2,
        'quarter': 1,
        'eighth': 0.5,
        '16th': 0.25,
        '32nd': 0.125
      };
      const durationInSeconds = durationMap[note.duration] || 1;
      await new Promise(resolve => setTimeout(resolve, durationInSeconds * 1000));
      console.log('Sus tamamlandı');
    } else {
      console.log('Nota çalınamadı:', {
        hasPlayer: !!playerRef.current,
        note
      });
    }
  };

  const playNextNote = async () => {
    console.log('playNextNote çağrıldı:', {
      currentIndex: currentNoteIndexRef.current,
      totalNotes: scoreNotesRef.current.length
    });

    if (currentNoteIndexRef.current >= scoreNotesRef.current.length) {
      console.log('Tüm notalar tamamlandı');
      handleStop();
      return;
    }

    const note = scoreNotesRef.current[currentNoteIndexRef.current];
    console.log('Sıradaki nota:', note);
    await playNote(note);
    currentNoteIndexRef.current++;

    // Sonraki notayı zamanla
    const durationMap = {
      'whole': 4,
      'half': 2,
      'quarter': 1,
      'eighth': 0.5,
      '16th': 0.25,
      '32nd': 0.125
    };
    
    const durationInSeconds = durationMap[note.duration] || 1;
    const interval = (60 / tempo) * durationInSeconds * 1000;
    console.log('Sonraki nota için zamanlama:', {
      duration: note.duration,
      durationInSeconds,
      tempo,
      interval
    });
    
    if (currentNoteIndexRef.current < scoreNotesRef.current.length) {
      playbackTimeoutRef.current = setTimeout(playNextNote, interval);
    } else {
      handleStop();
    }
  };

  const handlePlay = async () => {
    console.log('handlePlay çağrıldı');
    if (!audioInitialized) {
      console.log('Ses sistemi başlatılıyor...');
      await initializeAudio();
    }

    if (!isPlaying) {
      console.log('Çalma başlıyor');
      currentNoteIndexRef.current = 0;
      setIsPlaying(true);
      // State güncellemesini beklemeden doğrudan çal
      const note = scoreNotesRef.current[currentNoteIndexRef.current];
      console.log('İlk nota:', note);
      await playNote(note);
      currentNoteIndexRef.current++;

      // Sonraki notayı zamanla
      const durationMap = {
        'whole': 4,
        'half': 2,
        'quarter': 1,
        'eighth': 0.5,
        '16th': 0.25,
        '32nd': 0.125
      };
      
      const durationInSeconds = durationMap[note.duration] || 1;
      const interval = (60 / tempo) * durationInSeconds * 1000;
      console.log('İlk notadan sonra zamanlama:', {
        duration: note.duration,
        durationInSeconds,
        tempo,
        interval
      });
      playbackTimeoutRef.current = setTimeout(() => {
        if (currentNoteIndexRef.current < scoreNotesRef.current.length) {
          playNextNote();
        }
      }, interval);
    } else {
      console.log('Zaten çalınıyor');
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentNote('');
    currentNoteIndexRef.current = 0;
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
  };

  const handleTempoChange = (event, newValue) => {
    setTempo(newValue);
    if (isPlaying) {
      handleStop();
      handlePlay();
    }
  };

  useEffect(() => {
    if (playerRef.current && audioInitialized) {
      playerRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Nota Görüntüleyici
      </Typography>
      
      <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {!audioInitialized ? (
          <Button 
            variant="contained" 
            color="primary"
            onClick={initializeAudio}
          >
            Ses Sistemini Başlat
          </Button>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                onClick={handlePlay} 
                disabled={loading || isPlaying}
                color="primary"
              >
                <PlayArrow />
              </IconButton>
              <IconButton 
                onClick={handlePause} 
                disabled={loading || !isPlaying}
                color="primary"
              >
                <Pause />
              </IconButton>
              <IconButton 
                onClick={handleStop} 
                disabled={loading}
                color="primary"
              >
                <Stop />
              </IconButton>

              {currentNote && (
                <Typography 
                  variant="body1" 
                  sx={{ 
                    ml: 2,
                    bgcolor: 'primary.light',
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: 1
                  }}
                >
                  Çalınan Nota: {currentNote}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VolumeUp />
                <Slider
                  value={volume}
                  onChange={handleVolumeChange}
                  min={0}
                  max={1}
                  step={0.1}
                  sx={{ width: 100 }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>Tempo:</Typography>
                <Slider
                  value={tempo}
                  onChange={handleTempoChange}
                  min={60}
                  max={200}
                  step={5}
                  sx={{ width: 100 }}
                />
                <Typography>{tempo} BPM</Typography>
              </Box>
            </Box>
          </>
        )}
      </Box>

      <Box 
        sx={{ 
          position: 'relative',
          width: '100%',
          height: '70vh',
          border: '1px solid #ccc',
          backgroundColor: '#fff',
          overflow: 'auto'
        }}
      >
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            <CircularProgress />
            <Typography>Nota yükleniyor...</Typography>
          </Box>
        )}
        <div
          ref={divRef}
          style={{
            width: '100%',
            height: '100%',
            visibility: loading ? 'hidden' : 'visible'
          }}
        />
      </Box>
    </Box>
  );
};

export default MusicPlayer; 
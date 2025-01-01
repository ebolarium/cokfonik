import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Input, Checkbox, FormControlLabel } from '@mui/material';
import abcjs from 'abcjs';
import 'abcjs/abcjs-audio.css';

const MidiPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [abcNotation, setAbcNotation] = useState('');
  const [error, setError] = useState('');
  const [hideFinishedMeasures, setHideFinishedMeasures] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const [colorNote, setColorNote] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [synthInstance, setSynthInstance] = useState(null);

  useEffect(() => {
    // Notasyon her render edildiğinde notaları renklendir
    if (colorNote && abcNotation) {
      colorTheNotes();
    }
  }, [colorNote, abcNotation]);

  // Notaları kırmızıya boyar
  const colorTheNotes = () => {
    const noteEls = document.querySelectorAll('#notation .abcjs-note');
    noteEls.forEach((note) => {
      // fill veya stroke özelliğiyle oynayabilirsin
      note.style.fill = 'red';
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.musicxml')) {
      setError('Lütfen .musicxml uzantılı bir dosya seçin.');
      return;
    }

    setError('');
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      try {
        const parsedAbc = convertToABC(content);
        setAbcNotation(parsedAbc);

        // Notasyonu ilk kez render et
        renderNotation(parsedAbc);
      } catch (err) {
        console.error('Dosya dönüştürülürken hata oluştu:', err);
        setError('Dosya işlenirken bir hata oluştu. Lütfen geçerli bir dosya seçin.');
      }
    };

    reader.readAsText(file);
  };

  const convertToABC = (xmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
    const measures = xmlDoc.getElementsByTagName('measure');

    let abc = 'X:1\nT:Generated Tune\nM:4/4\nL:1/4\nK:C\n';
    for (let i = 0; i < measures.length; i++) {
      const notes = measures[i].getElementsByTagName('note');
      for (let j = 0; j < notes.length; j++) {
        const pitch = notes[j].getElementsByTagName('pitch')[0];
        const rest = notes[j].getElementsByTagName('rest')[0];

        if (rest) {
          abc += 'z';
        } else if (pitch) {
          const step = pitch.getElementsByTagName('step')[0]?.textContent || '';
          const octave = pitch.getElementsByTagName('octave')[0]?.textContent || '';
          const abcOctave = parseInt(octave, 10) - 4;
          const octaveModifier =
            abcOctave > 0
              ? "'".repeat(abcOctave)
              : ','.repeat(Math.abs(abcOctave));
          abc += step.toLowerCase() + octaveModifier;
        }
        abc += ' ';
      }
      abc += '| ';
    }

    return abc.trim();
  };

  const renderNotation = (notation) => {
    // ABCJS render
    const visualObj = abcjs.renderAbc('notation', notation, {
      responsive: 'false',
      scale: 2,
      staffwidth: 800,
      paddingtop: 20,
      paddingbottom: 20,
      add_classes: true,
    });

    // Eğer showCursor seçili değilse cursor'ı silelim
    if (!showCursor && cursor) {
      cursor.remove();
      setCursor(null);
    }
    // Eğer showCursor seçiliyse ve cursor yoksa oluştur
    if (showCursor && !cursor) {
      createCursor();
    }

    return visualObj;
  };

  const createCursor = () => {
    const svg = document.querySelector('#notation svg');
    if (!svg) return;

    const newCursor = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    newCursor.setAttribute('class', 'abcjs-cursor');
    newCursor.setAttribute('x1', '0');
    newCursor.setAttribute('y1', '0');
    newCursor.setAttribute('x2', '0');
    newCursor.setAttribute('y2', '0');
    svg.appendChild(newCursor);
    setCursor(newCursor);
  };

  const startPlayback = async () => {
    if (!abcNotation) return;
    stopPlayback(); // Çalmadan önce önceki sesi durdurup sıfırlayalım

    const visualObj = renderNotation(abcNotation);

    if (!visualObj || !visualObj[0]) {
      setError('Notasyon yüklenirken bir hata oluştu.');
      return;
    }

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const synth = new abcjs.synth.CreateSynth();

    try {
      await synth.init({
        visualObj: visualObj[0],
        audioContext,
        options: { swing: 0 },
      });
      await synth.prime();
      synth.start();
      setSynthInstance(synth);
      setIsPlaying(true);
    } catch (err) {
      console.error('Çalma başlatılamadı:', err);
      setError('Çalma işlemi sırasında bir hata oluştu.');
    }
  };

  const stopPlayback = () => {
    if (synthInstance) synthInstance.stop();
    setIsPlaying(false);

    if (cursor) {
      // Cursor çizgisini sıfırla
      cursor.setAttribute('x1', '0');
      cursor.setAttribute('x2', '0');
      cursor.setAttribute('y1', '0');
      cursor.setAttribute('y2', '0');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
      <Typography variant="h4">MusicXML Player</Typography>
      <Input type="file" accept=".musicxml" onChange={handleFileUpload} sx={{ mb: 2 }} />
      {error && <Typography color="error">{error}</Typography>}

      <Box id="notation" sx={{ width: '100%', border: '1px solid #ccc', mb: 2 }}></Box>

      <Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={hideFinishedMeasures}
              onChange={(e) => setHideFinishedMeasures(e.target.checked)}
            />
          }
          label="Hide Finished Measures"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showCursor}
              onChange={(e) => setShowCursor(e.target.checked)}
            />
          }
          label="Show Cursor"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={colorNote}
              onChange={(e) => setColorNote(e.target.checked)}
            />
          }
          label="Color Note"
        />
      </Box>

      <Button variant="contained" onClick={startPlayback} disabled={isPlaying}>
        Start
      </Button>
      <Button variant="contained" onClick={stopPlayback} disabled={!isPlaying}>
        Stop
      </Button>
    </Box>
  );
};

export default MidiPlayer;

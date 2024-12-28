import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Button, Modal, Paper, LinearProgress } from "@mui/material";
import Soundfont from "soundfont-player";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

// Level 1: Temel notalar
const level1Notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];

// Level 2: Diyezli/bemollü notalar
const level2Notes = [
  "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", 
  "G4", "G#4", "A4", "A#4", "B4"
];

// Level 3: İki oktav
const level3Notes = [
  "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
  "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4"
];

const noteNames = {
  // Birinci oktav
  "C3": "Do₃", "C#3": "Do#₃", "D3": "Re₃", "D#3": "Re#₃", "E3": "Mi₃",
  "F3": "Fa₃", "F#3": "Fa#₃", "G3": "Sol₃", "G#3": "Sol#₃", "A3": "La₃",
  "A#3": "La#₃", "B3": "Si₃",
  // İkinci oktav
  "C4": "Do₄", "C#4": "Do#₄", "D4": "Re₄", "D#4": "Re#₄", "E4": "Mi₄",
  "F4": "Fa₄", "F#4": "Fa#₄", "G4": "Sol₄", "G#4": "Sol#₄", "A4": "La₄",
  "A#4": "La#₄", "B4": "Si₄"
};

const LEVEL_THRESHOLDS = {
  2: 50,  // Level 1'den 2'ye geçiş için gereken puan
  3: 90   // Level 2'den 3'e geçiş için gereken puan
};

const IntervalGame = () => {
  const [piano, setPiano] = useState(null);
  const [currentNote, setCurrentNote] = useState("C4");
  const [targetNote, setTargetNote] = useState(null);
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [topScores, setTopScores] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openScoreboard, setOpenScoreboard] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    Soundfont.instrument(audioContext, "acoustic_grand_piano").then((p) => {
      setPiano(p);
    });
  }, []);

  const getCurrentNotes = () => {
    switch (level) {
      case 1:
        return level1Notes;
      case 2:
        return level2Notes;
      case 3:
        return level3Notes;
      default:
        return level1Notes;
    }
  };

  const getNextLevelThreshold = () => {
    if (level === 1) return LEVEL_THRESHOLDS[2];
    if (level === 2) return LEVEL_THRESHOLDS[3];
    return null;
  };

  const generateRandomNote = () => {
    const currentNotes = getCurrentNotes();
    let randomNote;
    do {
      randomNote = currentNotes[Math.floor(Math.random() * currentNotes.length)];
    } while (randomNote === targetNote);
    setTargetNote(randomNote);
    setHasAnswered(false);
  };

  const playInterval = () => {
    if (!piano || !targetNote) return;
    setMessage("");
    setIsPlaying(true);

    piano.play(currentNote, 0, { duration: 1 });
    setTimeout(() => {
      piano.play(targetNote, 0, { duration: 1 });
    }, 1000);

    setTimeout(() => {
      setIsPlaying(false);
    }, 2000);
  };

  useEffect(() => {
    if (gameActive && targetNote) {
      playInterval();
    }
  }, [targetNote, gameActive]);

  const calculateBonus = () => {
    return Math.floor(streak / 3); // Her 3 doğru cevap için 1 bonus puan
  };

  const checkAnswer = (guess) => {
    if (!gameActive || isPlaying || hasAnswered) return;
    setHasAnswered(true);

    if (guess === targetNote) {
      const bonus = calculateBonus();
      const pointsEarned = 5 + bonus;
      setStreak(prev => prev + 1);
      setMessage(`Doğru! ${bonus > 0 ? `+${pointsEarned} puan (${bonus} bonus)` : '+5 puan'} 🎉`);
      
      setScore(prev => {
        const newScore = prev + pointsEarned;

        // Level yükseltme kontrolü
        if (newScore >= LEVEL_THRESHOLDS[3] && level === 2) {
          setLevel(3);
          setMessage("Muhteşem! Level 3'e yükseldiniz! 🎉🌟");
        } else if (newScore >= LEVEL_THRESHOLDS[2] && level === 1) {
          setLevel(2);
          setMessage("Tebrikler! Level 2'ye yükseldiniz! 🎉");
        }

        return newScore;
      });

      setTimeout(() => {
        generateRandomNote();
      }, 1000);
    } else {
      setMessage("Yanlış! ❌");
      setStreak(0);
      setLives(prevLives => {
        const newLives = prevLives - 1;
        if (newLives > 0) {
          setTimeout(() => {
            playInterval();
            setHasAnswered(false);
          }, 1000);
        } else {
          endGame();
        }
        return newLives;
      });
    }
  };

  const fetchTopScores = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/scores/top/oyun2`);
      const data = await response.json();
      setTopScores(data);
    } catch (error) {
      console.error("En yüksek skorlar yüklenemedi:", error);
    }
  };

  const saveScore = useCallback(async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, game: 'oyun2', score }),
      });
      if (response.ok) {
        fetchTopScores();
      }
    } catch (error) {
      console.error("Skor API isteğinde hata:", error);
    }
  }, [score]);

  useEffect(() => {
    fetchTopScores();
  }, []);

  const startGame = () => {
    if (!piano) {
      setMessage("Piano yükleniyor, lütfen biraz bekleyin...");
      return;
    }
    setScore(0);
    setLives(3);
    setLevel(1);
    setStreak(0);
    setMessage("");
    setGameActive(true);
    setHasAnswered(false);
    generateRandomNote();
  };

  const endGame = () => {
    setGameActive(false);
    saveScore();
    setOpenModal(true);
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="center"
      bgcolor="#f9f9f9"
      padding="20px"
      marginTop="0px"
    >
      <Box textAlign="center" mb={3}>
        <Typography
          variant="h4"
          gutterBottom={false}
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          Aralık Oyunu
        </Typography>
        <Typography
          variant="h5"
          color="primary"
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          Level {level}
        </Typography>
      </Box>

      {/* Level ve Puan Bilgisi */}
      <Box width="100%" maxWidth="400px" mb={2}>
        <Typography variant="subtitle1" textAlign="center" mb={1}>
          {level === 1 && "Temel Notalar"}
          {level === 2 && "Diyez/Bemol Notalar"}
          {level === 3 && "İki Oktav"}
        </Typography>
        
        {getNextLevelThreshold() && (
          <>
            <Typography variant="caption" display="block" textAlign="center" mb={1}>
              Level {level + 1}'e: {getNextLevelThreshold() - score} puan kaldı
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(score / getNextLevelThreshold()) * 100}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </>
        )}
      </Box>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        maxWidth="400px"
        mb={2}
      >
        <Box display="flex" alignItems="center">
          {[1, 2, 3].map((heart) => (
            <Box key={heart} mr={1}>
              {lives >= heart ? (
                <FavoriteIcon color="error" />
              ) : (
                <FavoriteBorderIcon color="error" />
              )}
            </Box>
          ))}
        </Box>
        <Box textAlign="right">
          <Typography variant="h6">
            Skor: {score}
          </Typography>
          {streak > 0 && (
            <Typography variant="caption" color="success.main">
              Seri: {streak} 🔥
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        display="flex"
        justifyContent="center"
        gap="10px"
        mb={2}
        width="100%"
        maxWidth="400px"
      >
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setOpenScoreboard(true)}
          fullWidth
        >
          Skorboard
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            startGame();
            setOpenModal(false);
          }}
          disabled={gameActive}
          fullWidth
        >
          {gameActive ? "Oyun Devam Ediyor" : "Başla"}
        </Button>
      </Box>

      <Typography variant="subtitle1" textAlign="center" mb={2}>
        Çalan ilk nota {noteNames[currentNote]}. İkinci nota nedir?
      </Typography>

      <Box
        display="flex"
        justifyContent="center"
        flexWrap="wrap"
        mb={2}
        maxWidth="600px"
        width="100%"
      >
        {getCurrentNotes().map((n) => (
          <Button
            key={n}
            variant="contained"
            color={level === 1 ? "primary" : level === 2 ? "secondary" : "success"}
            size="small"
            sx={{
              margin: "4px",
              flex: level === 3 ? "1 1 calc(25% - 8px)" : "1 1 calc(33.333% - 8px)",
              minWidth: "60px",
              maxWidth: "100px",
              padding: "6px 12px",
              fontSize: "0.75rem",
            }}
            onClick={() => checkAnswer(n)}
            disabled={!gameActive || isPlaying || hasAnswered}
          >
            {noteNames[n]}
          </Button>
        ))}
      </Box>

      <Typography
        variant="h6"
        color={message.includes("Doğru") ? "success.main" : "error.main"}
        textAlign="center"
        mb={2}
      >
        {message}
      </Typography>

      {/* Game Over Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            maxWidth: "90%",
            width: "400px",
            textAlign: "center",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Oyun Bitti!
          </Typography>
          <Typography variant="h6" gutterBottom>
            Skorunuz: {score}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Ulaşılan Level: {level}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ marginTop: "20px" }}
            onClick={() => {
              startGame();
              setOpenModal(false);
            }}
          >
            Tekrar Oyna
          </Button>
        </Paper>
      </Modal>
      
      {/* Scoreboard Modal */}
      <Modal open={openScoreboard} onClose={() => setOpenScoreboard(false)}>
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            maxWidth: "90%",
            width: "400px",
            textAlign: "center",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Skorboard
          </Typography>
          {topScores.length > 0 ? (
            <Box>
              {topScores.map((entry, index) => (
                <Typography key={index} variant="body1" sx={{ mb: 1 }}>
                  {index + 1}. {entry.user?.name || "-"} {entry.user?.surname || "-"}: {entry.maxScore || "-"}
                </Typography>
              ))}
            </Box>
          ) : (
            <Typography variant="body1">
              Henüz bir skor bulunmuyor.
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            sx={{ marginTop: "20px" }}
            onClick={() => setOpenScoreboard(false)}
          >
            Kapat
          </Button>
        </Paper>
      </Modal>
    </Box>
  );
};

export default IntervalGame;

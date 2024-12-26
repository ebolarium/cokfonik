import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Button, Modal, Paper } from "@mui/material";
import Soundfont from "soundfont-player";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];
const noteNames = {
  C4: "Do",
  D4: "Re",
  E4: "Mi",
  F4: "Fa",
  G4: "Sol",
  A4: "La",
  B4: "Si"
};

const IntervalGame = () => {
  const [piano, setPiano] = useState(null);
  const [currentNote, setCurrentNote] = useState("C4");
  const [targetNote, setTargetNote] = useState(null);
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [topScores, setTopScores] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openScoreboard, setOpenScoreboard] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false); // Yeni state eklendi

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

  const generateRandomNote = () => {
    let randomNote;
    do {
      randomNote = notes[Math.floor(Math.random() * notes.length)];
    } while (randomNote === targetNote);
    setTargetNote(randomNote);
    setHasAnswered(false); // Yeni soru geldiğinde hasAnswered'ı sıfırla
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

  const checkAnswer = (guess) => {
    if (!gameActive || isPlaying || hasAnswered) return; // hasAnswered kontrolü eklendi
    setHasAnswered(true); // Cevap verildiğini işaretle

    if (guess === targetNote) {
      setMessage("Doğru! 🎉");
      setScore((prev) => prev + 5);
      setTimeout(() => {
        generateRandomNote();
      }, 1000);
    } else {
      setMessage("Yanlış! ❌");
      setLives((prevLives) => {
        const newLives = prevLives - 1;
        if (newLives > 0) {
          setTimeout(() => {
            playInterval();
            setHasAnswered(false); // Yanlış cevap sonrası tekrar deneme hakkı
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
      } else {
        console.error("Skor kaydedilirken hata oluştu.");
      }
    } catch (error) {
      console.error("Skor API isteğinde hata:", error);
    }
  }, [score]);

  useEffect(() => {
    fetchTopScores();
  }, [fetchTopScores]);

  const startGame = () => {
    if (!piano) {
      setMessage("Piano yükleniyor, lütfen biraz bekleyin...");
      return;
    }
    setScore(0);
    setLives(3);
    setMessage("");
    setGameActive(true);
    setHasAnswered(false); // Oyun başlangıcında hasAnswered'ı sıfırla
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
      <Typography
        variant="h4"
        gutterBottom
        textAlign="center"
        style={{ fontFamily: "'Press Start 2P', cursive" }}
      >
        Oyun2
      </Typography>

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
        <Typography variant="h6">
          Skor: {score}
        </Typography>
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
          Başla
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
        maxWidth="400px"
        width="100%"
      >
        {notes.map((n) => (
          <Button
            key={n}
            variant="contained"
            color="primary"
            size="small"
            sx={{
              margin: "4px",
              flex: "1 1 calc(33.333% - 8px)",
              minWidth: "60px",
              maxWidth: "100px",
              padding: "6px 12px",
              fontSize: "0.75rem",
            }}
            onClick={() => checkAnswer(n)}
            disabled={!gameActive || isPlaying || hasAnswered} // hasAnswered kontrolü eklendi
          >
            {noteNames[n]}
          </Button>
        ))}
      </Box>

      <Typography
        variant="h6"
        color={message.includes("Doğru") ? "green" : "red"}
        textAlign="center"
        mb={2}
      >
        {message}
      </Typography>

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
          <Button
            variant="contained"
            color="primary"
            sx={{ marginTop: "20px" }}
            onClick={() => {
              startGame();
              setOpenModal(false);
            }}
            disabled={gameActive}
          >
            Tekrar Oyna
          </Button>
        </Paper>
      </Modal>
      
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
                <Typography key={index}>
                  {index + 1}. {entry.user?.name || "-"} {entry.user?.surname || "-"}: {entry.maxScore || "-"}
                </Typography>
              ))}
            </Box>
          ) : (
            <Typography>Henüz bir skor bulunmuyor.</Typography>
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
// IntervalGame.js
import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Button, Modal, Paper } from "@mui/material";
import Soundfont from "soundfont-player";
import FavoriteIcon from '@mui/icons-material/Favorite'; // Dolmuş kalp ikonu
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'; // Boş kalp ikonu

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
  const [currentNote, setCurrentNote] = useState("C4"); // İlk nota
  const [targetNote, setTargetNote] = useState(null); // Hedef nota
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3); // Can durumu
  const [topScores, setTopScores] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openScoreboard, setOpenScoreboard] = useState(false);
  const [gameActive, setGameActive] = useState(false);

  // Piano enstrümanını yükle
  useEffect(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    Soundfont.instrument(audioContext, "acoustic_grand_piano").then((p) => {
      setPiano(p);
    });
  }, []);

  // Yeni rastgele nota üret, önceki notadan farklı olmalı
  const generateRandomNote = () => {
    let randomNote;
    do {
      randomNote = notes[Math.floor(Math.random() * notes.length)];
    } while (randomNote === targetNote); // Aynı notayı tekrarlamamak için
    setTargetNote(randomNote);
  };

  // Notaları çal
  const playInterval = () => {
    if (!piano || !targetNote) return;
    setMessage("");
    piano.play(currentNote, 0, { duration: 1 });
    setTimeout(() => {
      piano.play(targetNote, 0, { duration: 1 });
    }, 1000);
  };

  // targetNote değiştiğinde playInterval'ı tetikle
  useEffect(() => {
    if (gameActive && targetNote) {
      playInterval();
    }
  }, [targetNote, gameActive]);

  // Cevabı kontrol et
  const checkAnswer = (guess) => {
    if (!gameActive) return;

    if (guess === targetNote) {
      setMessage("Doğru! 🎉");
      setScore((prev) => prev + 5);
      // Doğru cevaptan sonra 1 saniye bekle
      setTimeout(() => {
        generateRandomNote(); // Yeni bir hedef nota belirle
      }, 1000);
      // playInterval otomatik olarak useEffect ile tetiklenecek
    } else {
      setMessage("Yanlış! ❌");
      setLives((prevLives) => {
        const newLives = prevLives - 1;
        if (newLives > 0) {
          // Yanlış cevaptan sonra 1 saniye bekle ve aynı notayı tekrar sor
          setTimeout(() => {
            playInterval(); // Aynı hedef notayı tekrar sor
          }, 1000);
        } else {
          endGame(); // Can kalmadı, oyunu bitir
        }
        return newLives;
      });
    }
  };

  // En yüksek skorları getir
  const fetchTopScores = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/scores/top/oyun2`);
      const data = await response.json();
      setTopScores(data);
    } catch (error) {
      console.error("En yüksek skorlar yüklenemedi:", error);
    }
  };

  // Skoru kaydet
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

  // Oyunu başlat
  const startGame = () => {
    if (!piano) {
      setMessage("Piano yükleniyor, lütfen biraz bekleyin...");
      return;
    }
    setScore(0);
    setLives(3); // Canları sıfırla
    setMessage("");
    setGameActive(true);
    generateRandomNote(); // Yeni bir hedef nota belirle
    // playInterval otomatik olarak useEffect ile tetiklenecek
  };

  // Oyunu bitir
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
      padding="10px"
      marginTop="0px"
    >
      <Typography variant="h4" gutterBottom textAlign="center">
        Oyun 2
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => setOpenScoreboard(true)}
        style={{ marginBottom: "20px" }}
      >
        Skorboard
      </Button>

      {/* Canları Göster */}
      <Box display="flex" alignItems="center" mb={2}>
        {[1, 2, 3].map((heart) => (
          <Box key={heart} mr={1}>
            {lives >= heart ? (
              <FavoriteIcon color="error" /> // Dolmuş kalp
            ) : (
              <FavoriteBorderIcon color="error" /> // Boş kalp
            )}
          </Box>
        ))}
      </Box>

      <Typography variant="h6" gutterBottom textAlign="center">
        Skor: {score}
      </Typography>

      <Box display="flex" gap="10px" marginBottom="20px">
        <Button
          variant="contained"
          color="primary"
          style={{ marginTop: "20px" }}
          onClick={() => {
            startGame();          // Oyunu yeniden başlat
            setOpenModal(false);  // Modal'ı kapat
          }}
        >
          Başla
        </Button>
      </Box>

      <Typography variant="h6" mt={2} textAlign="center">
        Bu çalınan ikinci notayı seçin:
      </Typography>
      <Box
        display="flex"
        justifyContent="center"
        flexWrap="wrap"
        mt={2}
        maxWidth="400px"
        width="100%"
      >
        {notes.map((n) => (
          <Button
            key={n}
            variant="contained"
            color="primary"
            style={{
              margin: "8px",
              flex: "1 1 calc(33.333% - 16px)",
              minWidth: "80px",
              maxWidth: "120px",
            }}
            onClick={() => checkAnswer(n)}
            disabled={!gameActive}
          >
            {noteNames[n]}
          </Button>
        ))}
      </Box>

      <Typography
        variant="h6"
        mt={2}
        color={message.includes("Doğru") ? "green" : "red"}
        textAlign="center"
      >
        {message}
      </Typography>

     {/* Oyun Bitti Modal'ı */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Paper
          style={{
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
            style={{ marginTop: "20px" }}
            onClick={() => {
              startGame();          // Oyunu yeniden başlat
              setOpenModal(false);  // Modal'ı kapat
            }}
          >
            Tekrar Oyna
          </Button>
        </Paper>
      </Modal>
      
      {/* Skorboard Modal'ı */}
      <Modal open={openScoreboard} onClose={() => setOpenScoreboard(false)}>
        <Paper
          style={{
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
            style={{ marginTop: "20px" }}
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

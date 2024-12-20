// IntervalGame.js
import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Button, Modal, Paper } from "@mui/material";
import Soundfont from "soundfont-player";

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
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);
  const [topScores, setTopScores] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openScoreboard, setOpenScoreboard] = useState(false);
  const [gameActive, setGameActive] = useState(false);

  useEffect(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    Soundfont.instrument(audioContext, "acoustic_grand_piano").then((p) => {
      setPiano(p);
    });
  }, []);

  const playInterval = () => {
    if (!piano) return;
    setMessage("");
    piano.play("C4", 0, { duration: 1 });
    setTimeout(() => {
      const randomNote = notes[Math.floor(Math.random() * notes.length)];
      setCurrentNote(randomNote);
      piano.play(randomNote, 0, { duration: 1 });
    }, 1000);
  };

  const checkAnswer = (guess) => {
    if (!gameActive) return;
    if (guess === currentNote) {
      setMessage("Doğru! 🎉");
      setScore((prev) => prev + 5);
    } else {
      setMessage("Yanlış! ❌");
    }
    setTimeout(() => {
      playInterval();
    }, 1000);
  };

  const fetchTopScores = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/scores/top`);
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
        body: JSON.stringify({ userId: user._id, score }),
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
    setScore(0);
    setMessage("");
    setGameActive(true);
    playInterval();
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

      <Typography variant="h6" gutterBottom textAlign="center">
        Skor: {score}
      </Typography>

      <Box display="flex" gap="10px" marginBottom="20px">
        <Button
          variant="contained"
          color="primary"
          onClick={startGame}
          disabled={gameActive}
        >
          Başlat
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={endGame}
          disabled={!gameActive}
        >
          Oyunu Bitir
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
              setScore(0);
              setOpenModal(false);
            }}
          >
            Kapat
          </Button>
        </Paper>
      </Modal>

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
          }}
        >
          <Typography variant="h5" gutterBottom>
            Skorboard
          </Typography>
          {topScores.length > 0 ? (
            <Box>
              {topScores.map((entry, index) => (
                <Typography key={index}>
                  {index + 1}. {entry.user?.name || "-"} {entry.user?.surname || "-"}:{" "}
                  {entry.totalScore || "-"}
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

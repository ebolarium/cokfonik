import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Modal, Paper } from "@mui/material";
import { Renderer, Stave, StaveNote, Voice, Formatter } from "vexflow";

const Game = () => {
  const [currentNote, setCurrentNote] = useState("c/4"); // Başlangıç notası
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0); // Skor
  const [timeLeft, setTimeLeft] = useState(60); // 1 dakikalık süre
  const [scores, setScores] = useState([]); // Skor tablosu
  const [openModal, setOpenModal] = useState(false); // Modal durumu

  const notes = [
    { name: "c/4", display: "Do" },
    { name: "d/4", display: "Re" },
    { name: "e/4", display: "Mi" },
    { name: "f/4", display: "Fa" },
    { name: "g/4", display: "Sol" },
    { name: "a/4", display: "La" },
    { name: "b/4", display: "Si" },
  ];

  // Yeni bir rastgele nota üret
  const generateNewNote = () => {
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    setCurrentNote(randomNote.name);
    setMessage("Doğru! 🎉");
  };

  // Kullanıcının cevabını kontrol et
  const checkAnswer = (selectedNote) => {
    if (timeLeft > 0) {
      if (selectedNote === currentNote) {
        setMessage("Doğru! 🎉");
        setScore((prevScore) => prevScore + 1);
        generateNewNote();
      } else {
        setMessage("Yanlış, tekrar dene! ❌");
      }
    }
  };

  // Porteyi ve notayı çiz
  useEffect(() => {
    const VF = { Renderer, Stave, StaveNote, Voice, Formatter };

    // VexFlow Renderer oluştur
    const div = document.getElementById("music-port");
    div.innerHTML = ""; // Eski çizimleri temizle
    const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    renderer.resize(400, 200);

    const context = renderer.getContext();
    const stave = new VF.Stave(10, 40, 380);
    stave.addClef("treble").setContext(context).draw();

    // Nota oluştur ve porte üzerinde çiz
    const staveNote = new VF.StaveNote({
      clef: "treble",
      keys: [currentNote],
      duration: "q",
    });

    const voice = new VF.Voice({ num_beats: 1, beat_value: 4 });
    voice.addTickable(staveNote);

    const formatter = new VF.Formatter();
    formatter.joinVoices([voice]).format([voice], 300);

    voice.draw(context, stave);
  }, [currentNote]);

  // Zamanlayıcıyı başlat
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      saveScore(); // Zaman bitince skoru kaydet
      setOpenModal(true); // Modalı aç
    }
  }, [timeLeft]);

  // Skoru kaydet
  const saveScore = async () => {
    const user = JSON.parse(localStorage.getItem("user")); // Kullanıcı bilgileri
    if (!user) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, score }),
      });
      if (response.ok) {
        console.log("Skor başarıyla kaydedildi!");
        fetchScores(); // Yeni skoru tabloya ekle
      } else {
        console.error("Skor kaydedilirken hata oluştu.");
      }
    } catch (error) {
      console.error("Skor API isteğinde hata:", error);
    }
  };

  // Skor tablosunu getir
  const fetchScores = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/scores/${user._id}`);
      const data = await response.json();
      setScores(data);
    } catch (error) {
      console.error("Skorlar yüklenemedi:", error);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#f9f9f9"
    >
      <Typography variant="h4" gutterBottom>
        Nota Oyunu
      </Typography>
      <Typography variant="h6" gutterBottom>
        Kalan Süre: {timeLeft} saniye
      </Typography>
      <Typography variant="h6" gutterBottom>
        Skor: {score}
      </Typography>
      <div id="music-port" style={{ marginBottom: "20px" }}></div>
      <Typography variant="h6" mt={2}>
        Bu notayı seçin:
      </Typography>
      <Box display="flex" justifyContent="center" flexWrap="wrap" mt={2}>
        {notes.map((note) => (
          <Button
            key={note.name}
            variant="contained"
            color="primary"
            style={{ margin: "8px" }}
            onClick={() => checkAnswer(note.name)}
          >
            {note.display}
          </Button>
        ))}
      </Box>
      <Typography
        variant="h6"
        mt={2}
        color={message.includes("Doğru") ? "green" : "red"}
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
            maxWidth: "400px",
            textAlign: "center",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Oyun Bitti!
          </Typography>
          <Typography variant="h6" gutterBottom>
            Skorunuz: {score}
          </Typography>
          <Typography variant="h6" gutterBottom>
            Skor Tablosu
          </Typography>
          {scores.length > 0 ? (
            <Box>
              {scores.map((entry, index) => (
                <Typography key={index}>
                  {index + 1}. Skor: {entry.score} - Tarih: {new Date(entry.date).toLocaleDateString()}
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
            onClick={() => {
              setScore(0);
              setTimeLeft(60);
              setOpenModal(false);
            }}
          >
            Tekrar Oyna
          </Button>
        </Paper>
      </Modal>
    </Box>
  );
};

export default Game;

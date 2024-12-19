import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Button, Modal, Paper } from "@mui/material";
import { Renderer, Stave, StaveNote, Voice, Formatter } from "vexflow";


const Game = () => {
  const [currentNote, setCurrentNote] = useState("c/4"); // Başlangıç notası
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0); // Skor
  const [timeLeft, setTimeLeft] = useState(60); // 1 dakikalık süre
  const [topScores, setTopScores] = useState([]); // En yüksek skorlar
  const [openModal, setOpenModal] = useState(false); // Modal durumu
  const [openScoreboard, setOpenScoreboard] = useState(false); // Skorboard modalı
  const [previousNote, setPreviousNote] = useState(null); // Önceki notayı saklamak için

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
    let randomNote;
    do {
      randomNote = notes[Math.floor(Math.random() * notes.length)];
    } while (randomNote.name === previousNote); // Aynı notayı seçmemek için kontrol
  
    setCurrentNote(randomNote.name); // Yeni notayı güncelle
    setPreviousNote(randomNote.name); // Önceki notayı güncelle
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
    renderer.resize(300, 150);

    const context = renderer.getContext();
    const stave = new VF.Stave(10, 40, 280);
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
    formatter.joinVoices([voice]).format([voice], 250);

    voice.draw(context, stave);
  }, [currentNote]);


  const saveScore = useCallback(async () => {
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
        fetchTopScores(); // En yüksek skorları güncelle
      } else {
        console.error("Skor kaydedilirken hata oluştu.");
      }
    } catch (error) {
      console.error("Skor API isteğinde hata:", error);
    }
  }, [score]);
  
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
  }, [timeLeft, saveScore]); // Bağımlılıklar: saveScore
  

  // En yüksek skorları getir
  const fetchTopScores = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/scores/top`);
      const data = await response.json();
      setTopScores(data);
    } catch (error) {
      console.error("En yüksek skorlar yüklenemedi:", error);
    }
  };

  useEffect(() => {
    fetchTopScores();
  }, []);

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="center"
      bgcolor="#f9f9f9"
      padding="10px"
      marginTop= "0px" // Üst boşluk kaldırıldı

    >
      <Typography variant="h4" gutterBottom textAlign="center">
        Nota Oyunu
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
        Kalan Süre: {timeLeft} saniye
      </Typography>
      <Typography variant="h6" gutterBottom textAlign="center">
        Skor: {score}
      </Typography>
      <Button
  variant="contained"
  color="primary"
  style={{ marginTop: "10px" }}
  onClick={() => {
    setScore(0);
    setTimeLeft(60);
  }}
>
  Başlat
</Button>
      <Box
            id="music-port"
            style={{
              marginBottom: "20px",
              width: "100%",
              maxWidth: "400px",
              height: "150px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",

            }}
          ></Box>
      <Typography variant="h6" mt={2} textAlign="center">
        Bu notayı seçin:
      </Typography>
      <Box
        display="flex"
        justifyContent="center"
        flexWrap="wrap"
        mt={2}
        maxWidth="400px"
        width="100%"
      >
        {notes.map((note) => (
          <Button
            key={note.name}
            variant="contained"
            color="primary"
            style={{
              margin: "8px",
              flex: "1 1 calc(33.333% - 16px)",
              minWidth: "80px",
              maxWidth: "120px",
            }}
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
              setTimeLeft(60);
              setOpenModal(false);
            }}
          >
            Tekrar Oyna
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

export default Game;

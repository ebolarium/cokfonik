import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Button, Modal, Paper } from "@mui/material";
import { Renderer, Stave, StaveNote, Voice, Formatter } from "vexflow";

const Game = () => {
  const [currentNote, setCurrentNote] = useState("c/4"); 
  const [currentGroup, setCurrentGroup] = useState("Do"); 
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0); 
  const [timeLeft, setTimeLeft] = useState(60); 
  const [topScores, setTopScores] = useState([]); 
  const [openModal, setOpenModal] = useState(false); 
  const [openScoreboard, setOpenScoreboard] = useState(false); 
  const [previousNote, setPreviousNote] = useState(null); 

  // 2 oktavlık notaları gruplu şekilde tutuyoruz
  const noteGroups = [
    { name: "Do", variants: ["c/4", "c/5"] },
    { name: "Re", variants: ["d/4", "d/5"] },
    { name: "Mi", variants: ["e/4", "e/5"] },
    { name: "Fa", variants: ["f/4", "f/5"] },
    { name: "Sol", variants: ["g/4", "g/5"] },
    { name: "La", variants: ["a/4", "a/5"] },
    { name: "Si", variants: ["b/4", "b/5"] },
  ];

  // Yeni bir rastgele nota üret
  const generateNewNote = () => {
    let randomGroup, randomVariant;
    do {
      randomGroup = noteGroups[Math.floor(Math.random() * noteGroups.length)];
      randomVariant =
        randomGroup.variants[
          Math.floor(Math.random() * randomGroup.variants.length)
        ];
    } while (randomVariant === previousNote);

    setCurrentNote(randomVariant);
    setCurrentGroup(randomGroup.name);
    setPreviousNote(randomVariant);
    setMessage("Doğru! 🎉");
  };

  // Kullanıcının cevabını kontrol et (oktavdan bağımsız kontrol)
  const checkAnswer = (selectedGroup) => {
    if (timeLeft > 0) {
      if (selectedGroup === currentGroup) {
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
    const div = document.getElementById("music-port");
    if (!div) return;
    div.innerHTML = "";
    const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    renderer.resize(300, 150);
  
    const context = renderer.getContext();
    const stave = new VF.Stave(10, 40, 280);
    stave.addClef("treble").setContext(context).draw();
  
    // Oktavı currentNote'dan ayır
    const octave = parseInt(currentNote.split('/')[1], 10);
    // Oktava bağlı olarak stem_direction belirle
    const stemDirection = octave >= 5 ? -1 : 1;
  
    // StaveNote'u stem_direction ile oluştur
    const staveNote = new VF.StaveNote({
      clef: "treble",
      keys: [currentNote],
      duration: "q",
      stem_direction: stemDirection, // Stem direction'ı ekle
    });
  
    // Alternatif olarak, StaveNote oluşturulduktan sonra setStemDirection kullanabilirsiniz:
    // const staveNote = new VF.StaveNote({
    //   clef: "treble",
    //   keys: [currentNote],
    //   duration: "q",
    // });
    // staveNote.setStemDirection(stemDirection);
  
    const voice = new VF.Voice({ num_beats: 1, beat_value: 4 });
    voice.addTickable(staveNote);
  
    const formatter = new VF.Formatter();
    formatter.joinVoices([voice]).format([voice], 250);
  
    voice.draw(context, stave);
  }, [currentNote]);
  

  // Skoru kaydet
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
        console.log("Skor başarıyla kaydedildi!");
        fetchTopScores(); 
      } else {
        console.error("Skor kaydedilirken hata oluştu.");
      }
    } catch (error) {
      console.error("Skor API isteğinde hata:", error);
    }
  }, [score]);

  // Geri sayım
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      saveScore();
      setOpenModal(true);
    }
  }, [timeLeft, saveScore]);

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
      marginTop="0px"
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
        {noteGroups.map((group) => (
          <Button
            key={group.name}
            variant="contained"
            color="primary"
            style={{
              margin: "8px",
              flex: "1 1 calc(33.333% - 16px)",
              minWidth: "80px",
              maxWidth: "120px",
            }}
            onClick={() => checkAnswer(group.name)}
          >
            {group.name}
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
                  {index + 1}. {entry.user?.name || "-"}{" "}
                  {entry.user?.surname || "-"}: {entry.totalScore || "-"}
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

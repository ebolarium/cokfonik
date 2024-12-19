const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

// Yeni puan ekle
router.post('/', async (req, res) => {
  const { userId, score } = req.body;
  try {
    const newScore = new Score({ userId, score });
    await newScore.save();
    res.status(201).json({ message: 'Puan başarıyla kaydedildi!', score: newScore });
  } catch (error) {
    res.status(500).json({ message: 'Puan kaydedilirken hata oluştu.', error });
  }
});

// Kullanıcının puanlarını getir
router.get('/:userId', async (req, res) => {
  try {
    const scores = await Score.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: 'Puanlar alınırken hata oluştu.', error });
  }
});

module.exports = router;

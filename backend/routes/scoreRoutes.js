const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

// En yüksek puanları getir
router.get('/top', async (req, res) => {
  try {
    console.log('Starting /top endpoint');
    const topScores = await Score.aggregate([
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$score' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $project: {
          _id: 1,
          totalScore: 1,
          user: { $arrayElemAt: ['$user', 0] }, // İlk eşleşmeyi alın
        },
      },
      {
        $sort: { totalScore: -1 },
      },
      { $limit: 10 },
    ]);

    console.log('Aggregated top scores:', topScores);

    res.status(200).json(topScores);
  } catch (error) {
    console.error('Error in /top endpoint:', error);
    res.status(500).json({ message: 'Top scores could not be retrieved', error });
  }
});

// Kullanıcının puanlarını getir
router.get('/:userId', async (req, res) => {
  try {
    const scores = await Score.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(scores);
  } catch (error) {
    console.error('Error retrieving user scores:', error);
    res.status(500).json({ message: 'Puanlar alınırken hata oluştu.', error });
  }
});

// Yeni puan ekle
router.post('/', async (req, res) => {
  const { userId, score } = req.body;
  try {
    const newScore = new Score({ userId, score });
    await newScore.save();
    res.status(201).json({ message: 'Puan başarıyla kaydedildi!', score: newScore });
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({ message: 'Puan kaydedilirken hata oluştu.', error });
  }
});

module.exports = router;

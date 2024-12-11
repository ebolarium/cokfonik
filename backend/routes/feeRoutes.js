const express = require('express');
const Fee = require('../models/Fee');
const router = express.Router();

// Son Altı Aya Ait Aidatları Getir
router.get('/last-six-months', async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);


    const fees = await Fee.find({
      $or: [
        { year: sixMonthsAgo.getFullYear(), month: { $gte: sixMonthsAgo.toLocaleString('tr-TR', { month: 'long' }) } },
        { year: now.getFullYear(), month: { $lte: now.toLocaleString('tr-TR', { month: 'long' }) } }
      ]
    }).populate('userId', 'name email');

    if (!fees.length) {
      return res.status(404).json({ message: 'Son altı aya ait aidat bulunamadı.' });
    }

    res.json(fees);
  } catch (error) {
    console.error('Error fetching fees for last six months:', error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedFee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedFee) {
      return res.status(404).json({ message: 'Aidat bulunamadı.' });
    }
    res.json(updatedFee);
  } catch (error) {
    console.error('Error updating fee:', error);
    res.status(400).json({ message: error.message });
  }
});

// Belirli Bir Kullanıcıya Ait Aidatları Getir
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const fees = await Fee.find({ userId });
    if (!fees.length) {
      return res.status(404).json({ message: 'Kullanıcıya ait aidat bulunamadı.' });
    }
    res.json(fees);
  } catch (error) {
    console.error('Error fetching user fees:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

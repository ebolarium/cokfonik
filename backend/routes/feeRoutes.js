const express = require('express');
const Fee = require('../models/Fee');
const router = express.Router();

// Son Altı Aya Ait Aidatları Getir
// Son Altı Aya Ait Aidatları Getir
router.get('/last-six-months', async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const fees = await Fee.find({ createdAt: { $gte: sixMonthsAgo } }).populate('userId', 'name email');

    if (!fees.length) {
      return res.status(404).json({ message: 'Son altı aya ait aidat bulunamadı.' });
    }

    res.json(fees);
  } catch (error) {
    console.error('Son altı ay aidatları alınırken hata:', error);
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
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;

const express = require('express');
const Fee = require('../models/Fee');



const router = express.Router();

// ÖNEMLİ: Spesifik route'ları önce tanımlayın
router.get('/last-six-months', async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5); // Son 6 ay için 5 ay geriye git

    // Son 6 ayın tarihlerini oluştur
    const months = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      months.push({
        month: date.toLocaleString('tr-TR', { month: 'long' }),
        year: date.getFullYear()
      });
    }

    // Tüm aidatları getir
    const fees = await Fee.find({
      $or: months.map(m => ({
        year: m.year,
        month: m.month
      }))
    }).populate({
      path: 'userId',
      select: 'name email part surname frozen',
      match: { _id: { $exists: true } }
    });

    // userId null olan kayıtları filtrele
    const validFees = fees.filter(fee => fee.userId !== null);

    if (!validFees.length) {
      return res.status(404).json({ message: 'Son altı aya ait aidat bulunamadı.' });
    }

    res.json(validFees);
  } catch (error) {
    console.error('Error fetching fees for last six months:', error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
});


// Kullanıcının aidat borcunu kontrol et
router.get('/check-unpaid/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const unpaidFees = await Fee.find({ userId, isPaid: false });
    if (unpaidFees.length > 0) {
      res.status(200).json({ hasUnpaidFees: true, unpaidCount: unpaidFees.length });
    } else {
      res.status(200).json({ hasUnpaidFees: false });
    }
  } catch (error) {
    console.error('Error checking unpaid fees:', error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
});




// Aidat güncelleme route'u
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

// Kullanıcıya ait aidatları getir - en sona koyulmalı çünkü en genel route
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
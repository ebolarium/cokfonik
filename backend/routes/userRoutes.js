const express = require('express');
const User = require('../models/User');
const Fee = require('../models/Fee');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');

const router = express.Router();

// Yardımcı Fonksiyon: Güncel Ay ve Yıl Bilgisi
const getCurrentMonthAndYear = () => {
  const now = new Date();
  return { month: now.toLocaleString('tr-TR', { month: 'long' }), year: now.getFullYear() };
};

// Yardımcı Fonksiyon: Gelecekteki Tüm Provalar İçin Devamsızlık Kaydı Oluştur
const createDefaultAttendance = async (userId) => {
  const futureEvents = await Event.find({ type: 'Prova', date: { $gte: new Date() } });
  const attendanceRecords = futureEvents.map((event) => ({
    userId,
    date: event.date,
    status: 'Gelmedi',
  }));
  await Attendance.insertMany(attendanceRecords);
};

// Kullanıcı kaydı
router.post('/register', async (req, res) => {
  const { name, surname, email, password, birthDate, phone, part } = req.body;
  try {
    const newUser = new User({
      name,
      surname,
      email,
      password,
      birthDate,
      phone,
      part,
      approved: false, // Varsayılan olarak onaylanmamış
      frozen: false, // Varsayılan olarak aktif
    });

    await newUser.save();

    // Aidat ve devamsızlık işlemleri
    const { month, year } = getCurrentMonthAndYear();
    const fee = new Fee({ userId: newUser._id, month, year });
    await fee.save();

    await createDefaultAttendance(newUser._id);

    res.status(201).json({ message: 'Kullanıcı başarıyla kaydedildi.', user: newUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin onayı
router.put('/:id/approve', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    res.json({ message: 'Kullanıcı onaylandı.', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Kullanıcı dondurma
router.put('/:id/freeze', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { frozen: true }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    res.json({ message: 'Kullanıcı donduruldu.', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Kullanıcı dondurmayı kaldırma
router.put('/:id/unfreeze', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { frozen: false }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    res.json({ message: 'Kullanıcı aktif hale getirildi.', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Tüm Kullanıcıları Getir
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Şifreyi hariç tutar
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Kullanıcı Silme
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    res.json({ message: 'Kullanıcı silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Kullanıcıyı Güncelle
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

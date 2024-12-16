const express = require('express');
const User = require('../models/User');
const Fee = require('../models/Fee');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer Konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile_photos'); // Fotoğraflar bu dizinde tutulacak
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.id}_${Date.now()}${path.extname(file.originalname)}`); // Benzersiz dosya adı
  },
});

const upload = multer({ storage });

// Profil Fotoğrafı Yükleme
router.post('/:id/upload-photo', upload.single('profilePhoto'), async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    const filePath = `/uploads/profile_photos/${req.file.filename}`;
    user.profilePhoto = filePath; // Fotoğraf yolu kaydedilir
    await user.save();

    res.status(200).json({
      message: 'Fotoğraf başarıyla yüklendi.',
      photoPath: filePath,
    });
  } catch (error) {
    console.error('Fotoğraf yüklenirken hata:', error);
    res.status(400).json({ message: 'Fotoğraf yüklenirken bir hata oluştu.' });
  }
});

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

// Kullanıcı Kaydı
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
      approved: false,
      frozen: false,
    });

    await newUser.save();

    // Aidat ve devamsızlık kayıtları
    const { month, year } = getCurrentMonthAndYear();
    const fee = new Fee({ userId: newUser._id, month, year });
    await fee.save();

    await createDefaultAttendance(newUser._id);

    res.status(201).json({ message: 'Kullanıcı başarıyla kaydedildi.', user: newUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Şifre Güncelleme
router.post('/:id/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    if (user.password !== currentPassword) {
      return res.status(400).json({ message: 'Mevcut şifre yanlış.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Şifre başarıyla güncellendi.' });
  } catch (error) {
    res.status(500).json({ message: 'Şifre güncellenirken hata oluştu.' });
  }
});

// Kullanıcı Bilgilerini Getir
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

// Kullanıcı Bilgilerini Güncelle
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true, omitUndefined: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Güncelleme sırasında hata oluştu.' });
  }
});

// Kullanıcı Silme
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    res.json({ message: 'Kullanıcı silindi.' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
});

module.exports = router;

const express = require('express');
const User = require('../models/User');
const Fee = require('../models/Fee');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const multer = require('multer');
const path = require('path');

const router = express.Router();



const fs = require('fs');

// Uploads dizininin varlığını kontrol edin
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}



// Multer Konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.id}_${Date.now()}${path.extname(file.originalname)}`); // Benzersiz dosya adı
  },
});

const upload = multer({ storage });

// Profil Fotoğrafı Yükleme Endpoint
router.post('/:id/upload-photo', upload.single('profilePhoto'), async (req, res) => {
  try {
    const userId = req.params.id;

    // Kullanıcıyı bul
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    // Profil fotoğrafı tam yolunu oluştur
    const filePath = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
    user.profilePhoto = filePath; // Fotoğraf tam URL ile kaydedilir
    await user.save();

    res.status(200).json({
      message: 'Fotoğraf başarıyla yüklendi.',
      photoPath: filePath, // Frontend için dönen tam URL
    });
  } catch (error) {
    console.error('Fotoğraf yüklenirken hata:', error);
    res.status(400).json({ message: 'Fotoğraf yüklenirken bir hata oluştu.' });
  }
});


// Kullanıcı Profilini Getir (token veya id üzerinden)
router.get('/profile', async (req, res) => {
  try {
    const { email } = req.query; // Kullanıcının email adresini al
    const user = await User.findOne({ email }).select('-password'); // Şifre hariç kullanıcıyı getir

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Kullanıcı profili alınırken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
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

// Şifre Güncelleme
router.post('/:id/change-password', async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    // Kullanıcıyı bul
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }


    // Yeni şifreyi kaydet
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Şifre başarıyla güncellendi.' });
  } catch (error) {
    console.error('Şifre güncellenirken hata:', error);
    res.status(500).json({ message: 'Şifre güncellenirken bir hata oluştu.' });
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
    const userId = req.params.id;

    // Kullanıcıyı bul ve gönderilen verilerle güncelle
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: req.body }, // Sadece gönderilen alanları günceller
      { new: true, runValidators: true, omitUndefined: true } // Valide et, undefined değerleri yok say
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Kullanıcı güncellenirken hata:', error);
    res.status(400).json({ message: error.message });
  }
});

router.get('/:id/profile', async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // ID'ye göre kullanıcıyı bul
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profil bilgileri alınırken hata:', error);
    res.status(500).json({ message: 'Bir hata oluştu' });
  }
});




module.exports = router;
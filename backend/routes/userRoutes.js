const express = require('express');
const User = require('../models/User');
const Fee = require('../models/Fee');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const router = express.Router();

// Uploads ve temp dizinlerinin varlığını kontrol edin
const uploadDir = path.join(__dirname, '../uploads');
const tempDir = path.join(__dirname, '../temp');

[uploadDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Geçici dosya yükleme için multer konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Sadece resim dosyalarına izin ver
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir.'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Profil Fotoğrafı Yükleme Endpoint
router.post('/:id/upload-photo', upload.single('profilePhoto'), async (req, res) => {
  let tempFilePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Lütfen bir fotoğraf seçin.' });
    }

    const userId = req.params.id;
    tempFilePath = req.file.path;

    // Kullanıcıyı bul
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Kullanıcı bulunamadı.');
    }

    // Cloudinary'ye yükle
    const uploadResult = await cloudinary.uploader.upload(tempFilePath, {
      folder: 'profile-photos',
      public_id: userId, // Sadece userId kullan
      overwrite: true,
      resource_type: 'image',
      transformation: [{
        width: 400,
        height: 400,
        crop: 'fill',
        gravity: 'face'
      }],
      format: 'jpg',
      quality: 'auto'
    });

    // Eski fotoğrafı silmeye gerek yok çünkü overwrite: true kullanıyoruz

    // Kullanıcı profilini güncelle
    const photoUrl = uploadResult.secure_url;
    user.profilePhoto = photoUrl;
    await user.save();

    // Başarılı yanıt
    res.status(200).json({
      message: 'Fotoğraf başarıyla yüklendi.',
      photoUrl: photoUrl
    });

  } catch (error) {
    console.error('Fotoğraf yüklenirken hata:', error);
    res.status(error.message === 'Kullanıcı bulunamadı.' ? 404 : 400).json({ 
      message: error.message || 'Fotoğraf yüklenirken bir hata oluştu.'
    });
  } finally {
    // Geçici dosyayı temizle
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (unlinkError) {
        console.error('Geçici dosya silinirken hata:', unlinkError);
      }
    }
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
    status: 'Bekleniyor',
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
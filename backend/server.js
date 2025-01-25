// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const path = require('path');
const webPush = require('web-push');
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

dotenv.config(); // .env dosyasını proje kök dizininden yükler

const User = require('./models/User'); // User modeli
const Fee = require('./models/Fee'); // Aidat modeli
const Announcement = require('./models/Announcement'); // Announcement modeli

const app = express();
app.use(cors());
app.use(express.json());

// Uploads dizinini oluştur
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGO_URI, {

})
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// VAPID anahtarlarını ayarlayın
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('VAPID_PUBLIC_KEY ve VAPID_PRIVATE_KEY ortam değişkenleri ayarlanmalı.');
  process.exit(1);
}

webPush.setVapidDetails(
  'mailto:barisboga@gmail.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// API Rotaları
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
const feeRoutes = require('./routes/feeRoutes');
app.use('/api/fees', feeRoutes);
const attendanceRoutes = require('./routes/attendanceRoutes');
app.use('/api/attendance', attendanceRoutes);
const eventRoutes = require('./routes/eventRoutes');
app.use('/api/events', eventRoutes);
const announcementRoutes = require('./routes/announcementRoutes');
app.use('/api/announcements', announcementRoutes);
const managementRoutes = require('./routes/managementRoutes');
app.use('/api/management', managementRoutes);


// Yeni Subscription Routes'ı Ekleyin
const subscriptionRoutes = require('./routes/subscriptionRoutes');
app.use('/api', subscriptionRoutes); // /api/subscribe

const scoreRoutes = require('./routes/scoreRoutes');
app.use('/api/scores', scoreRoutes);

// Statik Dosya Yolu
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Login Endpoint (bcrypt kaldırıldı)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Kullanıcı bulunamadı.' });
    }

    // Şifreyi doğrudan karşılaştırma
    if (password !== user.password) {
      return res.status(401).json({ message: 'Hatalı şifre.' });
    }

    res.status(200).json({
      message: 'Giriş başarılı!',
      user: user,
    });
  } catch (error) {
    console.error('Login endpoint error:', error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
});

app.post('/api/upload-musicxml', upload.single('file'), (req, res) => {
  res.json({ filePath: req.file.path });
});

// Cron Job - Yeni Aidat Kayıtları
cron.schedule('0 0 1 * *', async () => {
  const now = new Date();
  const month = now.toLocaleString('tr-TR', { month: 'long' });
  const year = now.getFullYear();

  try {
    const users = await User.find();
    const feePromises = users.map(async (user) => {
      const existingFee = await Fee.findOne({ userId: user._id, month, year });
      if (!existingFee) {
        const newFee = new Fee({ userId: user._id, month, year });
        await newFee.save();
      }
    });
    await Promise.all(feePromises);
    console.log('Yeni aidat kayıtları başarıyla oluşturuldu.');
  } catch (error) {
    console.error('Aidat kayıtları oluşturulurken hata:', error.message);
  }
});





// React Build Dosyalarını Sun (Backend klasöründen bir üst dizindeki build klasörüne erişiyoruz)
app.use(express.static(path.join(__dirname, '../build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Sunucuyu Dinleme
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

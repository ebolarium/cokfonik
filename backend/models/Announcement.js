const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Okuyan kullanıcıların ID'leri
  hiddenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Gizleyen kullanıcıların ID'leri

});

module.exports = mongoose.model('Announcement', AnnouncementSchema);

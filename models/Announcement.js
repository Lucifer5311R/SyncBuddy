const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    text: String,
    type: String,
    scheduledTime: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);

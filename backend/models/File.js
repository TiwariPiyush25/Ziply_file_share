const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    filePath: { type: String, required: true },
    originalName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 900 } // 15 minutes me auto-delete
});

module.exports = mongoose.model('File', fileSchema);
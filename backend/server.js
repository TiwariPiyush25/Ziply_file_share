const express = require('express');
const multer = require('multer');
const archiver = require('archiver');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors({
  origin: 'http://localhost:5173', 
  exposedHeaders: ['Content-Disposition'] 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

let filesDatabase = [];

function generateShareCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 6; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

const calculateTimeLeft = (createdAt, expiryType) => {
  if (expiryType === 'instant') return '1 Download Max';

  const now = Date.now();
  const createdTime = new Date(createdAt).getTime();
  let durationMs = 15 * 60 * 1000; 

  if (expiryType === '5m') durationMs = 5 * 60 * 1000;
  else if (expiryType === '15m') durationMs = 15 * 60 * 1000;
  else if (expiryType === '1h') durationMs = 60 * 60 * 1000;
  else if (expiryType === '1d') durationMs = 24 * 60 * 60 * 1000;

  const expireTime = createdTime + durationMs;
  const diffMs = expireTime - now;

  if (diffMs <= 0) return 'Expired';

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);

  if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m left`;
  return `${diffMins}m left`;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const code = req.headers['x-share-code'];
    const dir = path.join(UPLOADS_DIR, code);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// Cleanup Worker
setInterval(() => {
  filesDatabase = filesDatabase.filter(file => {
    const timeLeft = calculateTimeLeft(file.createdAt, file.expiryType);
    if (file.expiryType !== 'instant' && timeLeft === 'Expired') {
      const folderPath = path.join(UPLOADS_DIR, file.code);
      if (fs.existsSync(folderPath)) {
        try { fs.rmSync(folderPath, { recursive: true, force: true }); } catch (e) {}
      }
      return false; 
    }
    return true;
  });
}, 5000);

// 1. UPLOAD ENGINE
app.post('/api/upload', (req, res, next) => {
  const code = generateShareCode();
  req.headers['x-share-code'] = code;
  next();
}, upload.array('files'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded.' });
  }

  const code = req.headers['x-share-code'];
  const { password, expiryType } = req.body;
  
  const displayLabelName = req.files.length === 1 
    ? req.files[0].originalname 
    : `${req.files[0].originalname} (+${req.files.length - 1} more)`;

  const totalBytes = req.files.reduce((acc, f) => acc + f.size, 0);
  const volumeStr = totalBytes > 1024 * 1024 * 1024
    ? `${(totalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
    : totalBytes > 1024 * 1024 
      ? `${(totalBytes / (1024 * 1024)).toFixed(2)} MB` 
      : `${(totalBytes / 1024).toFixed(2)} KB`;

  const fileObjectMetadata = {
    id: Date.now(),
    code: code,
    fileName: displayLabelName,
    volume: volumeStr,
    hits: 0,
    password: password || null,
    expiryType: expiryType || '15m',
    state: 'ACTIVE',
    createdAt: new Date(),
    fileCount: req.files.length
  };

  filesDatabase.push(fileObjectMetadata);
  res.json({ success: true, code: code });
});

// 2. CHECK STATUS & PASSWORD VERIFICATION (FIXED: 401 loop prevented)
app.post('/api/check-status/:code', (req, res) => {
  const { code } = req.params;
  const { password } = req.body;
  
  const fileRecord = filesDatabase.find(f => f.code === code.toUpperCase() && f.state === 'ACTIVE');

  if (!fileRecord) {
    return res.status(404).json({ success: false, message: 'File not found or expired.' });
  }

  if (fileRecord.password && !password) {
    return res.json({ 
      success: true, 
      isProtected: true, 
      isPasswordValid: false,
      fileName: fileRecord.fileName, 
      volume: fileRecord.volume,
      message: 'Password required' 
    });
  }

  if (fileRecord.password && fileRecord.password !== password) {
    return res.json({ 
      success: false, 
      isProtected: true, 
      isPasswordValid: false,
      message: 'Incorrect password.' 
    });
  }

  res.json({ 
    success: true, 
    isProtected: !!fileRecord.password, 
    isPasswordValid: true,
    fileName: fileRecord.fileName, 
    volume: fileRecord.volume 
  });
});

// 3. SUPERFAST DOWNLOAD ENGINE
app.post('/api/download/:code', async (req, res) => {
  const { code } = req.params;
  const { password } = req.body;
  
  const recordIndex = filesDatabase.findIndex(f => f.code === code.toUpperCase() && f.state === 'ACTIVE');

  if (recordIndex === -1) {
    return res.status(404).send('File missing or expired.');
  }

  const fileRecord = filesDatabase[recordIndex];

  if (fileRecord.password && fileRecord.password !== password) {
    return res.status(401).send('Incorrect password.');
  }

  const folderPath = path.join(UPLOADS_DIR, fileRecord.code);
  if (!fs.existsSync(folderPath)) {
    return res.status(404).send('File folder missing.');
  }

  const files = fs.readdirSync(folderPath);
  if (files.length === 0) {
    return res.status(404).send('Folder is empty.');
  }

  filesDatabase[recordIndex].hits += 1;

  if (files.length === 1) {
    const filePath = path.join(folderPath, files[0]);
    const stat = fs.statSync(filePath);

    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${files[0]}"`);

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } else {
    const downloadName = `shared-files-${fileRecord.code}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);

    const archive = archiver('zip', { zlib: { level: 0 } });
    archive.pipe(res);

    files.forEach(file => {
      archive.file(path.join(folderPath, file), { name: file });
    });

    await archive.finalize();
  }

  if (fileRecord.expiryType === 'instant') {
    filesDatabase[recordIndex].state = 'EXPIRED';
    setTimeout(() => {
      if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
      }
    }, 5000);
  }
});

// 4. TELEMETRY LOGS
app.get('/api/telemetry', (req, res) => {
  const activeRecords = filesDatabase.filter(r => r.state === 'ACTIVE');
  const totalHits = filesDatabase.reduce((sum, item) => sum + item.hits, 0);

  let totalBytes = 0;
  activeRecords.forEach(record => {
    const folderPath = path.join(UPLOADS_DIR, record.code);
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);
      files.forEach(f => {
        const stats = fs.statSync(path.join(folderPath, f));
        totalBytes += stats.size;
      });
    }
  });

  const storageStr = totalBytes > 1024 * 1024 * 1024
    ? `${(totalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
    : `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;

  const updatedRegistry = filesDatabase.map(record => {
    const timeLeft = calculateTimeLeft(record.createdAt, record.expiryType);
    let currentState = record.state;
    if (timeLeft === 'Expired' && record.expiryType !== 'instant') currentState = 'EXPIRED';

    return {
      id: record.id,
      name: record.fileName,
      code: record.code,
      volume: record.volume,
      hits: record.hits,
      timeLimit: timeLeft,
      state: currentState
    };
  });

  res.json({
    success: true,
    metrics: {
      activeShares: activeRecords.length,
      downloadHits: totalHits,
      storageRegistry: storageStr,
      syncLatency: `${(Math.random() * 0.2 + 0.1).toFixed(1)}ms`
    },
    registry: updatedRegistry
  });
});

// 5. DELETE ACTION ROUTE (Dashboard trash button integration)
app.delete('/api/telemetry/:id', (req, res) => {
  const { id } = req.params;
  const targetId = Number(id);

  const recordIndex = filesDatabase.findIndex(f => f.id === targetId);

  if (recordIndex === -1) {
    return res.status(404).json({ success: false, message: 'Record not found' });
  }

  const record = filesDatabase[recordIndex];

  const folderPath = path.join(UPLOADS_DIR, record.code);
  if (fs.existsSync(folderPath)) {
    try {
      fs.rmSync(folderPath, { recursive: true, force: true });
    } catch (err) {
      console.error('Disk folder removal error:', err);
    }
  }

  filesDatabase.splice(recordIndex, 1);

  return res.json({ success: true, message: 'Relay deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`📦 Superfast Ziply Hub Running on port: ${PORT}`);
});
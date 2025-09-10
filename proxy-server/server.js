const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const PORT = process.env.PORT || 4000;
const BACKEND_BASE = process.env.BACKEND_BASE;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // Postman 같은 경우
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
}));

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file is required' });

    const { originalname, mimetype, buffer } = req.file;
    const authHeader = req.header('authorization');

    if (!authHeader) return res.status(401).json({ error: 'Authorization header is required' });

    // 1️⃣ presigned URL 요청
    const presignedResp = await axios.post(
      `${BACKEND_BASE}/api/admin/main-img/presigned-url`,
      { filename: originalname, contentType: mimetype },
      {
        headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      }
    );

    const uploadUrl = presignedResp.data.uploadUrl || presignedResp.data;
    const imageUrl = uploadUrl.split('?')[0];

    // 2️⃣ S3 업로드
    await axios.put(uploadUrl, buffer, {
      headers: { 'Content-Type': mimetype },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      withCredentials: false,
    });

    // 3️⃣ 백엔드 DB 등록
    const registerResp = await axios.post(
      `${BACKEND_BASE}/api/admin/main-img`,
      { imageUrl },
      {
        headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      }
    );

    return res.json(registerResp.data);

  } catch (err) {
    console.error('Proxy upload error:', JSON.stringify(err.response?.data || err.message || err));
    const status = err.response?.status || 500;
    return res.status(status).json({ error: err.response?.data || err.message || 'upload failed' });
  }
});


app.listen(PORT, () => {
  console.log(`✅ Proxy server running on http://localhost:${PORT}`);
});

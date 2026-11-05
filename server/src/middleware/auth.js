import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import { Admin } from '../models/index.js';

export const requireAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.va_admin;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(id);
    if (!admin) return res.status(401).json({ message: 'Not authenticated' });
    req.admin = admin;
    next();
  } catch { res.status(401).json({ message: 'Not authenticated' }); }
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../uploads');
fs.mkdirSync(uploadDir, { recursive: true });

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype) ? cb(null, true) : cb(new Error('Only JPG, PNG or WebP images allowed')),
});

const useCloud = () => !!process.env.CLOUDINARY_CLOUD_NAME && !!process.env.CLOUDINARY_API_KEY;

// Returns a URL for the uploaded buffer (Cloudinary if configured, else local disk)
export const saveImage = async (file, folder = 'va') => {
  if (!file) return '';
  if (useCloud()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (e, r) => (e ? reject(e) : resolve(r.secure_url))).end(file.buffer);
    });
  }
  const ext = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }[file.mimetype];
  const name = crypto.randomBytes(12).toString('hex') + ext;
  fs.writeFileSync(path.join(uploadDir, name), file.buffer);
  const base = process.env.PUBLIC_API_URL || '';
  return `${base}/uploads/${name}`;
};

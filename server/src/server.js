import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import { ensureDefaults } from './utils/seed.js';
import { startExpiryJob } from './jobs/expirePending.js';

const port = process.env.PORT || 5000;
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('Missing MONGODB_URI or JWT_SECRET. Copy .env.example to .env');
  process.exit(1);
}
await mongoose.connect(process.env.MONGODB_URI);
await ensureDefaults();
startExpiryJob();
app.listen(port, () => console.log(`API running on :${port}`));

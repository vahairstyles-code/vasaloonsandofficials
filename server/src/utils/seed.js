import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { Admin, Service, Product, BusinessSettings } from '../models/index.js';

const services = [
  ['Hair', 'Haircut (Regular)', 99, 'Classic everyday cut.', true],
  ['Hair', 'Kids Haircut', 79, 'Gentle cut for little ones.'],
  ['Hair', 'Hair Dry & Gel', 49, 'Blow-dry with styling gel.'],
  ['Shave & Beard', 'Shaving', 49, 'Smooth, clean shave.'],
  ['Shave & Beard', 'Trimming', 49, 'Neat edge-up and trim.'],
  ['Shave & Beard', 'Beard Color', 49, 'Even, natural-look colour.'],
  ['Skin Care', 'De-Tan Pack', 199, 'Tan removal face pack.', true],
  ['Skin Care', 'Scrub', 149, 'Refreshing face scrub.', true],
  ['Skin Care', 'Beauty Facial', 999, 'Complete premium facial.'],
  ['Head Care', 'Head Massage', 99, 'Stress-relief massage.'],
  ['Head Care', 'Head Wash', 49, 'Refreshing shampoo wash.'],
  ['Head Care', 'Black Color Gel', 99, 'Instant black hair colour.'],
];

const products = [
  ['Trimmers & Clippers', 'Kemei KM-3909', 'Professional hair clipper. 1400mAh battery, metal body, LCD display.'],
  ['Trimmers & Clippers', 'GEEMY Professional Hair Trimmer', 'Model GM professional hair trimmer.'],
  ['Trimmers & Clippers', 'SI-C1098 Hair Clipper', 'USB charging, 5W hair clipper.'],
  ['Hair Colour', 'Beaute Blanc Fruit Vinegar Professional Hair Color', 'Natural Black, 500ml x 2. Ammonia free, 100% grey coverage (as supplied product claim).'],
  ['Hair Colour', 'Streax Professional Argan Secrets Hair Colourant Cream', 'Enriched with argan oil.'],
  ['Hair Colour', 'Kamill Hair Color Cream 9.66 Shocking Pink', 'Fashion shade.'],
  ['Hair Colour', 'Garnier Color Naturals Developer Milk', 'Developer milk for hair colour.'],
  ['Face & Skin Care', 'DR.RASHEL Aloe Vera Sheet Mask', 'Aloe vera facial sheet mask.', { mrp: 75, offerPrice: 49 }],
  ['Face & Skin Care', 'DR.RASHEL Lemon Refreshing Facial Sheet Mask', 'Refreshing lemon facial sheet mask.'],
  ['Face & Skin Care', 'Professional Feel Gold Facial Kit', '5 in 1 gold facial kit.'],
  ['Face & Skin Care', 'Celestial Premium Choco Mint Face Mask', '300gm face mask.'],
  ['Face & Skin Care', 'TWACHA Elixir Tan Remover', '325ml tan remover.'],
  ['Face & Skin Care', 'ORVEL Herbals De-Tan Face Pack', 'With kojic and milk, 500ml.'],
  ['Face & Skin Care', 'Yash Herbal Charcoal Mask Cream', 'Bamboo charcoal, anti-blackhead, 80g.'],
  ['Face & Skin Care', 'Aroma Strawberry Peel Off Mask', 'For all skin types, 25% extra free.'],
  ['Hair & Body Essentials', 'NANDINI Herbal Hair Serum', 'Herbal hair serum.'],
  ['Hair & Body Essentials', 'TRU Hair & Skin Hair Wax', 'Hair wax for styling.'],
  ['Hair & Body Essentials', '7 Hills Amaravati Herbal Cool Oil', 'Herbal cool oil.'],
  ['Hair & Body Essentials', 'NEYCARE Red Enzo Hair Spray', 'Hair spray.'],
  ['Hair & Body Essentials', 'Dazller Talc Fantazy', 'Talc.'],
  ['Hair & Body Essentials', 'Original RAJA Ayurvedic Cream', 'Ayurvedic cream.'],
  ['Hair & Body Essentials', 'Velnik Shaving Foam', 'Shaving foam.'],
];

export async function ensureDefaults() {
  await BusinessSettings.updateOne({ key: 'main' }, { $setOnInsert: { key: 'main' } }, { upsert: true });
  // Migrate older admin documents that were created before email login existed
  const email = (process.env.INITIAL_ADMIN_EMAIL || 'admin@vahaircut.local').toLowerCase();
  const legacy = await Admin.findOne({ email: { $exists: false } });
  if (legacy) { legacy.email = email; await legacy.save(); }
  if (!(await Admin.countDocuments())) {
    const pw = process.env.INITIAL_ADMIN_PASSWORD || 'ChangeMe@123';
    await Admin.create({ email, passwordHash: await bcrypt.hash(pw, 12), mustChangePassword: true });
    console.log(`Admin created for ${email}. Log in with the initial password and change it immediately.`);
  }
  if (!(await Service.countDocuments())) {
    await Service.insertMany(services.map(([category, name, price, description, featured], i) => ({ category, name, price, description, featured: !!featured, order: i })));
    console.log('Services seeded');
  }
  if (!(await Product.countDocuments())) {
    await Product.insertMany(products.map(([category, name, description, extra], i) => ({ category, name, description, featured: i < 4, ...(extra || {}) })));
    console.log('Products seeded');
  }
}

if (process.argv[1]?.endsWith('seed.js')) {
  await mongoose.connect(process.env.MONGODB_URI);
  await ensureDefaults();
  await mongoose.disconnect();
}

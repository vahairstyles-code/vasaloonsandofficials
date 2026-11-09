import mongoose from "mongoose";
const { Schema, model } = mongoose;
const opts = { timestamps: true };

export const Admin = model(
  "Admin",
  new Schema(
    {
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      username: { type: String, default: "admin" },
      passwordHash: { type: String, required: true, select: false },
      mustChangePassword: { type: Boolean, default: true },
      role: { type: String, default: "admin" },
    },
    opts,
  ),
);

export const Service = model(
  "Service",
  new Schema(
    {
      name: { type: String, required: true, trim: true },
      description: { type: String, default: "" },
      price: { type: Number, required: true, min: 0 },
      category: { type: String, required: true, index: true },
      image: { type: String, default: "" },
      active: { type: Boolean, default: true },
      featured: { type: Boolean, default: false },
      order: { type: Number, default: 0 },
    },
    opts,
  ),
);

export const Product = model(
  "Product",
  new Schema(
    {
      name: { type: String, required: true, trim: true },
      description: { type: String, default: "" },
      category: { type: String, required: true, index: true },
      price: { type: Number, min: 0 }, // optional: never invented
      mrp: { type: Number, min: 0 },
      offerPrice: { type: Number, min: 0 },
      image: { type: String, default: "" },
      available: { type: Boolean, default: true },
      featured: { type: Boolean, default: false },
    },
    opts,
  ),
);

export const Customer = model(
  "Customer",
  new Schema(
    {
      name: String,
      phone: { type: String, unique: true, index: true },
      totalBookings: { type: Number, default: 0 },
    },
    opts,
  ),
);

const BOOKING_STATUS = [
  "PAYMENT_PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
  "NO_SHOW",
];
const PAYMENT_STATUS = [
  "PENDING",
  "SCREENSHOT_SUBMITTED",
  "VERIFIED",
  "REJECTED",
  "REFUNDED",
];

const bookingSchema = new Schema(
  {
    bookingId: { type: String, unique: true, index: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    services: [
      { serviceId: Schema.Types.ObjectId, name: String, price: Number },
    ],
    totalAmount: Number,
    advanceAmount: Number,
    remainingAmount: Number,
    date: { type: String, required: true, index: true }, // YYYY-MM-DD (Asia/Kolkata)
    time: { type: String, required: true }, // HH:mm 24h
    // slotKey is unique only for active bookings -> atomic double-booking protection
    slotKey: { type: String, default: null },
    notes: String,
    paymentScreenshot: String,
    paymentStatus: { type: String, enum: PAYMENT_STATUS, default: "PENDING" },
    status: {
      type: String,
      enum: BOOKING_STATUS,
      default: "PAYMENT_PENDING",
      index: true,
    },
    adminNotes: String,
  },
  opts,
);
bookingSchema.index(
  { slotKey: 1 },
  { unique: true, partialFilterExpression: { slotKey: { $type: "string" } } },
);
export const Booking = model("Booking", bookingSchema);

export const Gallery = model(
  "Gallery",
  new Schema(
    {
      image: { type: String, required: true },
      caption: String,
      category: { type: String, default: "Haircuts" },
      featured: { type: Boolean, default: false },
    },
    opts,
  ),
);

export const BlockedSlot = model(
  "BlockedSlot",
  new Schema(
    {
      date: { type: String, required: true, index: true },
      time: { type: String, default: null }, // null = whole day
      reason: String,
    },
    opts,
  ),
);

export const PromoBanner = model(
  "PromoBanner",
  new Schema(
    {
      text: String,
      link: String,
      active: { type: Boolean, default: true },
    },
    opts,
  ),
);

export const AuditLog = model(
  "AuditLog",
  new Schema(
    {
      action: String,
      entity: String,
      entityId: String,
      meta: Schema.Types.Mixed,
      admin: String,
    },
    opts,
  ),
);

export const BusinessSettings = model(
  "BusinessSettings",
  new Schema(
    {
      key: { type: String, default: "main", unique: true },
      name: { type: String, default: "V.A Haircut & Officials" },
      phone: { type: String, default: "7330947785" },
      whatsapp: { type: String, default: "7330947785" },
      upiId: { type: String, default: "7330947785-10@ybl" },
      address: {
        type: String,
        default: "Beside SBI Bank, Gurazala, Andhra Pradesh",
      },
      mapLink: {
        type: String,
        default:
          "https://www.google.com/maps/search/?api=1&query=Gurazala+Andhra+Pradesh",
      },
      openTime: { type: String, default: "09:00" },
      closeTime: { type: String, default: "21:00" },
      slotInterval: { type: Number, default: 30 },
      capacityPerSlot: { type: Number, default: 1 },
      advanceAmount: { type: Number, default: 10 },
      heroHeading: {
        type: String,
        default: "DEFINE YOUR STYLE.\nOWN YOUR PRESENCE.",
      },
      heroSubtitle: {
        type: String,
        default:
          "Precision grooming. Timeless style. An experience crafted for the modern man.",
      },
      about: {
        type: String,
        default:
          "V.A Haircut & Officials is a men's grooming salon in Gurazala focused on precision cuts, personal style and a clean, comfortable experience.",
      },
      footer: {
        type: String,
        default: "© V.A Haircut & Officials. All rights reserved.",
      },
      seoTitle: {
        type: String,
        default: "V.A Haircut & Officials | Premium Men's Grooming, Gurazala",
      },
      seoDescription: {
        type: String,
        default:
          "Premium men's grooming salon in Gurazala. Haircuts, beard, skin care and appointment booking.",
      },
    },
    opts,
  ),
);

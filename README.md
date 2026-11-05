# V.A Haircut & Officials — MERN Salon Website & Booking Platform

Premium men's grooming website for V.A Haircut & Officials, Gurazala, Andhra Pradesh.
React + Vite + Tailwind + Framer Motion + React Three Fiber (client) · Node/Express + MongoDB + JWT cookie auth (server).

## Features
- Cinematic homepage (lazy-loaded 3D scissors on desktop only, image-free fallback on mobile / reduced-motion / no WebGL)
- Services, products, gallery, about, contact, privacy, terms, cancellation & refund pages — all content from MongoDB
- 5-step-style booking: multi-service, 30-min slots (09:00–20:30), server-side pricing, ₹10 advance, UPI link, screenshot upload, WhatsApp click-to-chat message
- Screenshot upload never confirms a booking — the admin verifies payment first
- Double-booking protection via a unique partial index (`slotKey`) — atomic even under simultaneous requests
- Unpaid reservations are auto-released after 30 minutes
- Admin at `/admin`: email + password login, forced password change at first login, dashboard, bookings (verify/reject payment, confirm, cancel, reschedule, complete, no-show, notes, manual booking, CSV export), services/products/gallery CRUD with image upload, website content + SEO + banners, availability (hours, interval, capacity, advance, block dates/slots), customers, reports, audit log
- Security: helmet, rate limits, bcrypt, httpOnly cookie, Zod validation, NoSQL-injection sanitising, upload type/size checks

## Admin login
The admin icon (top right of the website navbar) opens `/admin`.
The first admin account is created automatically on first server start from `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD` in `server/.env`. You are forced to set a new password at first login.

## Run locally
```bash
# 1. Server
cd server
cp .env.example .env      # fill MONGODB_URI, JWT_SECRET, INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD
npm install
npm run dev               # http://localhost:5000  (seeds services, products, settings, admin)

# 2. Client (new terminal)
cd client
npm install
npm run dev               # http://localhost:5173  (proxies /api to :5000)
```
`npm run seed` in `server/` re-runs the seeder (it only inserts when collections are empty).

## Environment variables (server)
| Name | Purpose |
|---|---|
| MONGODB_URI | MongoDB Atlas connection string |
| JWT_SECRET | long random string |
| CLIENT_URL | frontend URL(s), comma-separated (CORS) |
| INITIAL_ADMIN_EMAIL / INITIAL_ADMIN_PASSWORD | first admin account |
| CLOUDINARY_* | optional; without them images are stored in `server/uploads` (ephemeral on Render free tier — use Cloudinary in production) |
| PUBLIC_API_URL | API public URL (only for local-disk uploads) |

Client: `VITE_API_URL` = your Render API URL (empty in development).

## Deploy
**Database:** create a free MongoDB Atlas cluster, allow network access, copy the connection string.

**Backend → Render:** New Web Service → root directory `server` → build `npm install` → start `npm start`. Add the env vars above with `NODE_ENV=production`, `CLIENT_URL=https://<your-vercel-domain>`. Admin cookies use `SameSite=None; Secure` in production (works cross-site over HTTPS).

**Frontend → Vercel:** import repo → root directory `client` → framework Vite → env `VITE_API_URL=https://<your-render-service>.onrender.com`. Add `client/vercel.json` rewrite (included) so deep links like `/admin` work.

## Notes
- Product images/prices: only supplied data is seeded; no prices were invented. Upload photos in Admin → Products.
- Service images, gallery photos and hero photography are uploaded by the owner through the admin panel (no stock photos are bundled).
- The legal pages are sensible starting text — have them reviewed before relying on them.
- Change `upiId` in Admin → Website Content to the real UPI ID (the seeded value is a placeholder derived from the phone number).

# 🔮 GyaniTalk – Astrology Platform & Admin Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.2-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)

**GyaniTalk** is a comprehensive, production-grade astrology management platform and administrative dashboard built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Prisma ORM**. It provides complete end-to-end tooling for managing astrologers, customer consultations, Vedic astrological calculations (Kundli, Matching, Panchang), Astro Mall e-commerce, wallet transactions, real-time communications, and CMS content.

---

## 🌟 Key Features

### 🧙‍♂️ Astrologer & Consultation Management
- **Astrologer Profiles & Onboarding:** Complete verification, commission rates for calls/chats, status toggles, skills, and languages.
- **Consultation Channels:** Voice calls powered by Exotel and real-time audio/video streaming via Agora.
- **Chat & History:** In-depth customer interaction logs, chat transcripts, reviews, and ratings.

### 🌌 Vedic Astrology & Calculations
- **Kundli Generation & Matching:** Automated chart creation and Ashtakoot guna milan.
- **Panchang & Horoscope:** Daily, monthly, and yearly horoscopes, Rahu Kaal, Choghadiya, and auspicious timings via Astrology API and VedicAstro integrations.

### 💰 Wallet & Payment Processing
- **Razorpay Integration:** Automated payments, top-ups, and webhook processing for instant wallet recharge.
- **Earnings & Payouts:** Astrologer earnings tracking, commission distribution, and withdrawal request approvals/rejections.

### 🛍️ Astro Mall & E-Commerce
- **Product & Course Catalog:** Physical astro items, gemstones, remedies, and astrological courses.
- **Order Management:** Invoice generation, order status lifecycle, and shipping management.

### 📝 CMS & SEO Suite
- **Rich Content Management:** Blogs and articles powered by Tiptap rich-text editor with YouTube, table, and image embed support.
- **SEO & Search Indexing:** Dynamic metadata, Canonical URLs, sitemap generator, and IndexNow instant indexing.
- **Banners & Announcements:** Dynamic hero banners, promo alerts, and push notifications via Firebase Cloud Messaging (FCM).

### 🛡️ Security & Authentication
- **Secure Access:** Multi-tiered role authentication with JWT & refresh token rotation.
- **SMS / OTP Verification:** Integrated OTP verification via MSG91 with rate limiting and lockout safeguards.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router & Server Actions)
- **Frontend:** [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Framer Motion](https://www.framer.com/motion/)
- **Database & ORM:** [MariaDB / MySQL](https://mariadb.org/) via [Prisma ORM 7](https://www.prisma.io/)
- **Storage:** [AWS S3](https://aws.amazon.com/s3/)
- **Authentication & Notifications:** [Firebase Admin](https://firebase.google.com/), JWT (`jose`, `jsonwebtoken`)
- **Payments:** [Razorpay](https://razorpay.com/)
- **Communications:** [Exotel](https://exotel.com/) (Telephony/IVR), [Agora](https://www.agora.io/) (Real-time Audio/Video)
- **Editor:** [Tiptap](https://tiptap.dev/)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:
- **Node.js** >= 18.x (Recommended: Node 20+)
- **npm** >= 9.x or **yarn** / **pnpm**
- **MySQL** or **MariaDB** database server

### 1. Clone the Repository

```bash
git clone https://github.com/kiran037/gyanitalk.git
cd gyanitalk
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Duplicate the example environment file and configure your credentials:

```bash
cp .env.example .env
```

Open `.env` and fill in your database connection string, AWS S3 keys, Razorpay credentials, Firebase service account, and third-party API keys. See [Environment Variables](#-environment-variables) below for details.

### 4. Database Setup & Prisma Generation

Generate the Prisma Client and run migrations:

```bash
# Generate Prisma Client
npx prisma generate

# Apply migrations or push schema to database
npx prisma db push
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🔐 Environment Variables

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | MySQL/MariaDB connection URL |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `JWT_REFRESH_SECRET` | Secret key for JWT refresh tokens |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key for S3 uploads |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `AWS_REGION` | AWS S3 region (e.g., `ap-south-1`) |
| `AWS_BUCKET_NAME` | S3 bucket name |
| `NEXT_PUBLIC_BASEURL` | Public base URL for uploaded media |
| `FIREBASE_PROJECT_ID` | Firebase project ID for notifications |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin private key (PEM format) |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email |
| `ASTROLOGYAPI_API_KEY` | AstrologyAPI credentials for Kundli/Horoscope |
| `VEDICASTRO_API_KEY` | VedicAstro API key |
| `OTP_API_KEY` | MSG91 API key for SMS / OTP delivery |
| `RAZORPAY_KEY_ID` | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret |
| `EXOTEL_API_KEY` | Exotel telephony API key |
| `AGORA_APP_ID` | Agora App ID for audio/video calling |

Refer to [`.env.example`](./.env.example) for the full list of configuration options.

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server at `localhost:3000` |
| `npm run build` | Compiles optimized production bundle |
| `npm run start` | Starts Next.js production server |
| `npm run lint` | Runs ESLint to check for code quality and warnings |
| `npx prisma studio` | Opens Prisma Studio GUI to inspect and manage database records |

---

## 📂 Project Structure

```text
├── prisma/
│   ├── schema.prisma       # Prisma ORM database models
│   └── migrations/         # Database migrations
├── public/                 # Static assets, logos, and banners
├── src/
│   ├── app/                # Next.js App Router (Pages, Layouts, API routes)
│   ├── components/         # Reusable UI & Admin dashboard components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility helpers, Prisma client, S3, Exotel, Razorpay
│   ├── types/              # TypeScript definitions & interfaces
│   └── styles/             # Global CSS and Tailwind directives
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
└── package.json            # Project dependencies and scripts
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/kiran037/gyanitalk/issues).

---

## 📄 License

This project is proprietary and confidential to **GyaniTalk**.

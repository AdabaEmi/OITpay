# OITpay — Course Registration & Payment Portal

**OITpay** is the official full-stack course registration, payment processing, and student onboarding portal for **Othello Institute of Technology (OIT)**.

It provides prospective students with an intuitive, mobile-responsive enrollment experience featuring dynamic course catalog selection, live fee calculations in Nigerian Naira (₦), secure **Paystack Hosted Checkout**, transactional email alerts via **Brevo**, cloud persistence via **Google Cloud Firebase Firestore**, and automatic redirection to the **OIT Admissions WhatsApp chat**.

---

## Table of Contents

- [Overview & Architecture](#overview--architecture)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [How It Was Built](#how-it-was-built)
  - [1. Frontend Architecture & Design](#1-frontend-architecture--design)
  - [2. Backend & Express Server (`server.ts`)](#2-backend--express-server-serverts)
  - [3. Paystack Hosted Checkout](#3-paystack-hosted-checkout)
  - [4. Brevo Transactional Email System](#4-brevo-transactional-email-system)
  - [5. Firebase Firestore & Security Rules](#5-firebase-firestore--security-rules)
  - [6. Atomic Idempotency Architecture](#6-atomic-idempotency-architecture)
  - [7. Automatic WhatsApp Redirection](#7-automatic-whatsapp-redirection)
- [Environment Variables](#environment-variables)
- [Getting Started & Local Development](#getting-started--local-development)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Development Server](#running-the-development-server)
  - [Building for Production](#building-for-production)
- [How to Use the Portal](#how-to-use-the-portal)
  - [For Students](#for-students)
  - [For Administrators](#for-administrators)
- [Course Catalog & Fee Structure](#course-catalog--fee-structure)
- [License & Support](#license--support)

---

## Overview & Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       OITpay React Frontend (SPA)                           │
│                                                                             │
│  ┌─────────────────────────┐  ┌──────────────────────┐  ┌────────────────┐  │
│  │    RegistrationForm     │  │    PaymentSummary    │  │ Callback Modal │  │
│  │ (Live Validations + UI) │  │ (Dynamic Fee Engine) │  │ (Verify & WA)  │  │
│  └────────────┬────────────┘  └──────────────────────┘  └───────┬────────┘  │
└───────────────┼─────────────────────────────────────────────────┼───────────┘
                │ POST /api/payments/initialize                   │ GET /api/payments/verify/:ref
                ▼                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Node.js / Express Backend (server.ts)                   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │              Server-Side Controller & Atomic Idempotency              │  │
│  │       (Price Integrity Check + In-Memory & Firestore Lock)            │  │
│  └──────┬──────────────────────────┬──────────────────────────┬──────────┘  │
│         │                          │                          │             │
│         ▼                          ▼                          ▼             │
│  ┌──────────────┐          ┌───────────────┐         ┌───────────────────┐  │
│  │   Paystack   │          │  Brevo Email  │         │ WhatsApp Service  │  │
│  │     API      │          │    Service    │         │  (Pre-filled URL  │  │
│  │ (Initialize  │          │ (Admin Alert  │         │  Generator for    │  │
│  │  & Verify)   │          │  + Receipt)   │         │   wa.me redirect) │  │
│  └──────┬───────┘          └───────┬───────┘         └───────────────────┘  │
└─────────┼──────────────────────────┼────────────────────────────────────────┘
          │                          │
          ▼                          ▼
┌───────────────────┐      ┌───────────────────┐     ┌────────────────────────┐
│   Paystack API    │      │  Brevo REST API   │     │   Firebase Firestore   │
│ (Hosted Checkout) │      │  (v3/smtp/email)  │     │ (/registrations/{ref}) │
└───────────────────┘      └───────────────────┘     └────────────────────────┘
```

---

## Key Features

1. **Course Track Selection & Auto-Duration**: Selecting any tech track automatically pre-fills the recommended duration and recalculates the exact registration and tuition fees.
2. **Server-Side Price Validation**: Fees are validated against the authoritative server catalog (`src/data/courses.ts`). Client payloads cannot tamper with course pricing.
3. **Paystack Hosted Checkout**: Students complete payment securely on Paystack's hosted payment gateway (Card, USSD, Bank Transfer, Apple Pay, etc.).
4. **Strict Atomic Idempotency**: Double charges and duplicate registrations are blocked at both initialization and verification stages using unique cryptographic references and idempotency locks.
5. **Instant Brevo Email Notifications**:
   - **Admin Notification**: Instant email to the admissions team containing complete student info, selected course, duration, and fee breakdown.
   - **Student Payment Receipt**: HTML confirmation receipt emailed to the student with payment details and a direct "Chat on WhatsApp" action button.
6. **Automatic WhatsApp Redirection**: Upon verified payment, the student's browser is automatically redirected to the OIT Admissions WhatsApp number with a pre-filled, formatted enrollment message.
7. **Cloud Persistence in Firebase Firestore**: Verified registrations are stored permanently in Firestore for auditable tracking and verification.
8. **Edge-to-Edge Mobile Responsiveness**: Tailored layout with borderless cards, touch-optimized dropdowns, and compact spacing on mobile devices.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Framer Motion (`motion/react`), Lucide React, Vite |
| **Backend** | Node.js (v22), Express.js, TypeScript |
| **Database** | Google Cloud Firestore (Firebase Web SDK) |
| **Payment Gateway** | Paystack Standard API (Hosted Checkout) |
| **Email Service** | Brevo v3 Transactional Email REST API (`/v3/smtp/email`) |
| **Messaging** | WhatsApp Click-to-Chat (`https://wa.me/...`) |

---

## How It Was Built

### 1. Frontend Architecture & Design
- **React Components (`src/components/`)**:
  - `Header.tsx`: Displays the OIT brand logo (`/oit_logo.jfif`), portal title, and payment security badges.
  - `HeroBanner.tsx`: High-resolution hero display with the custom banner asset (`/oit_banner.jpeg`) and brand value proposition.
  - `RegistrationForm.tsx`: Controlled form capturing student Full Name, Email, Phone, Gender, Course Track, and Duration.
  - `PaymentSummary.tsx`: Dynamic breakdown showing Registration Fee, Course Fee, Total Payable, and Paystack trust badges.
  - `Footer.tsx`: Responsive footer with OIT accreditation statements, links, and copyright notices.
- **State & Callback Handling (`src/App.tsx`)**:
  - Listens for URL query parameters returned from Paystack (`?reference=...` or `?trxref=...`).
  - Displays interactive loading, verification, success, and error states.

### 2. Backend & Express Server (`server.ts`)
- Serves as the full-stack API server and Vite middleware integration.
- Hosts endpoints:
  - `POST /api/payments/initialize`: Validates input, checks idempotency, communicates with Paystack to generate a checkout URL, and saves pending state.
  - `GET /api/payments/verify/:reference`: Verifies transaction status with Paystack, marks status as `PAID`, triggers Brevo emails (strictly once), and returns the WhatsApp redirect link.
  - `POST /api/payments/webhook`: Webhook listener for asynchronous Paystack transaction events.

### 3. Paystack Hosted Checkout
- When a student clicks **Proceed to Payment**, the backend calls Paystack's `/transaction/initialize` API with amount in kobo (`amount * 100`), student email, custom metadata, and a callback URL.
- The client receives `authorization_url` and redirects the student (`window.location.href = data.authorizationUrl`).

### 4. Brevo Transactional Email System
- Integrated via Brevo's REST API (`https://api.brevo.com/v3/smtp/email`).
- Sends responsive HTML emails with inline styling:
  1. **Admin Alert**: Highlights student contact info, gender, course, and total paid.
  2. **Student Receipt**: Provides receipt proof and a WhatsApp onboarding button.

### 5. Firebase Firestore & Security Rules
- Built with a dual-collection design defined in `firebase-blueprint.json`:
  - `/registrations/{reference}`: Stores permanent registration records.
  - `/idempotency_locks/{idempotencyKey}`: Tracks active transaction locks.
- Guarded by hardened `firestore.rules` enforcing strict type checking, regex validation on document IDs, PII isolation, and immutable terminal state locking once paid.
- Uses universal Firebase Web SDK in Node.js with in-memory fallback for high availability.

### 6. Atomic Idempotency Architecture
- **Initialization Gate**: Generates a deterministic key (`idem_<email>_<courseId>_<timestamp>`). If a paid transaction already exists for that key, duplicate checkout is blocked.
- **Fulfillment Lock**: The `emailNotified` boolean in the registration document guarantees that refreshing the confirmation page or triggering multiple verification requests will **never dispatch duplicate emails or alter transaction states twice**.

### 7. Automatic WhatsApp Redirection
- Generates a pre-formatted WhatsApp message:
  ```
  Hello OIT Admissions 👋, I have successfully registered and paid for [Course Name] ([Duration]) via OITpay.
  
  Payment & Student Details:
  • Amount Paid: ₦[Amount]
  • Reference: [Reference]
  • Full Name: [Student Name]
  • Email: [Email]
  • Phone: [Phone]
  • Gender: [Gender]
  
  Please verify my enrollment and share further onboarding instructions.
  ```
- Automatically navigates the user's browser after payment verification, with a manual fallback button available on the success screen.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
# General App Configuration
APP_URL="http://localhost:3000"

# Paystack API Keys (sk_test_... or sk_live_...)
PAYSTACK_SECRET_KEY="sk_test_your_paystack_secret_key"

# Brevo (Sendinblue) Transactional Email API Key (xkeysib-...)
BREVO_API_KEY="xkeysib-your_brevo_api_key"

# Sender Details in Brevo (Must be a verified sender in your Brevo account)
BREVO_SENDER_EMAIL="admissions@oit.edu.ng"
BREVO_SENDER_NAME="Othello Institute of Technology (OITpay)"

# Admin Notification Email (Receives new student payment alerts)
ADMIN_NOTIFICATION_EMAIL="admissions@oit.edu.ng"

# Admin WhatsApp Number (International format without '+' sign, e.g., 2348012345678)
ADMIN_WHATSAPP_NUMBER="2348012345678"
```

---

## Getting Started & Local Development

### Prerequisites
- **Node.js**: v20 or v22 LTS
- **npm** or **bun**
- Active **Paystack** account (Test or Live keys)
- Active **Brevo** account with API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/oitpay.git
cd oitpay

# Install dependencies
npm install
```

### Running the Development Server

```bash
# Start the full-stack Express + Vite development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Building for Production

```bash
# Type check and build frontend assets
npm run build

# Start the production server
npm start
```

---

## How to Use the Portal

### For Students
1. Navigate to the portal homepage.
2. Enter your **Full Name**, **Active Phone Number**, and **Valid Email Address**.
3. Select your **Gender** (`Male` or `Female`).
4. Choose your desired **Tech Track & Course**. The **Duration** will automatically pre-fill with the track duration.
5. Review the **Payment Summary** (Registration Fee + Course Tuition Fee).
6. Click **Proceed to Payment**. You will be securely redirected to Paystack.
7. Complete your payment using your preferred payment channel on Paystack.
8. Upon successful payment, you will be redirected back to OITpay:
   - Your receipt will be automatically emailed to you.
   - You will be automatically redirected to the **OIT Admissions WhatsApp chat** with your enrollment details ready to send.

### For Administrators
1. **Email Alerts**: Every time a student completes a payment, an email notification is instantly sent to `ADMIN_NOTIFICATION_EMAIL` containing all student information and the Paystack payment reference.
2. **WhatsApp Inquiries**: Students will land directly in your WhatsApp inbox (`ADMIN_WHATSAPP_NUMBER`) with pre-filled verification messages.
3. **Database Records**: View and audit all student enrollments, payment channels, timestamps, and references in the **Firebase Console** under the `registrations` collection.

---

## Course Catalog & Fee Structure

| Course Track | Duration | Registration Fee | Course Fee | Total Payable |
|---|---|---|---|---|
| **Software Development Bootcamp** | 5 Months (20 Weeks) | ₦10,000 | ₦160,000 | **₦170,000** |
| **Full Data Analytics Track (Excel, SQL, Power BI)** | 4 Months (16 Weeks) | ₦10,000 | ₦50,000 | **₦60,000** |
| **Cybersecurity & Ethical Hacking** | 4 Months (16 Weeks) | ₦10,000 | ₦180,000 | **₦190,000** |
| **Data Science & Machine Learning** | 4 Months (16 Weeks) | ₦10,000 | ₦140,000 | **₦150,000** |
| **UI/UX & Graphics Design** | 3.5 Months (14 Weeks) | ₦10,000 | ₦150,000 | **₦160,000** |
| **Generative AI** | 3 Months (12 Weeks) | ₦10,000 | ₦100,000 | **₦110,000** |
| **ICT Fundamentals (Computer Basics)** | 1 Month (4 Weeks) | ₦5,000 | ₦30,000 | **₦35,000** |

*All prices can be configured in `src/data/courses.ts`.*

---

## License & Support

Developed for **Othello Institute of Technology (OIT)**.  
For technical support or admissions inquiries, contact the OIT Admissions Team.

<div align="center">

# ⛏️ MineOS

### Mining Intelligence & Smart Operations System

**Safety • Compliance • GIS • Workforce Management**

![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)
![Expo](https://img.shields.io/badge/Expo-React_Native-000020?style=flat-square&logo=expo)

</div>

---

## 🚀 About

**MineOS** is a centralized mining governance platform designed to improve **mine safety, statutory compliance, inspections, workforce monitoring, and operational management**.

It connects field-level activities with GIS, dashboards, alerts, and centralized data management.

---

## ✨ Features

- 🛡️ **Incident & Safety Management** — Report and track mine incidents.
- 🔍 **Digital Inspections** — Geo-tagged inspections with checklists and evidence.
- ⚠️ **Violation Management** — Track and manage safety and compliance violations.
- 🔧 **Corrective Actions** — Assign, monitor and verify corrective actions.
- 🗺️ **GIS Mapping** — Visualize mines, incidents, inspections and workforce locations.
- 👷 **Workforce Attendance** — GPS-based attendance and emergency roll-call.
- 🔔 **Alerts & Escalation** — Notifications for critical events and overdue actions.
- 📊 **Compliance Dashboard** — Monitor mine-wise compliance and operational status.
- 🔐 **Role-Based Access** — Secure access based on user responsibilities.

---

## 🏗️ Architecture

```text
Mobile App ──────┐
                 │
Web Dashboard ───┼──► Node.js / Express ───► MongoDB
                 │             │
                 └─────────────┴──► GIS
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Web | React, TypeScript, Vite, Tailwind CSS |
| Mobile | React Native, Expo |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| GIS | OpenStreetMap, Leaflet |
| Authentication | JWT, bcrypt |

---

# ⚙️ Installation Guide

## Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) 18+
- [MongoDB](https://www.mongodb.com/)
- [Git](https://git-scm.com/)
- [Expo](https://expo.dev/) for mobile development

---

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/MineOS.git

cd MineOS
```

---

## 2. Backend Setup

```bash
cd Backend

npm install
```

Create a `.env` file inside the `Backend` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

---

## 3. Web Application Setup

Open a new terminal:

```bash
cd application/web

npm install

npm run dev
```

Open the URL shown by Vite in your browser.

---

## 4. Mobile Application Setup

Open another terminal:

```bash
cd application/mobile

npm install

npx expo start
```

Scan the QR code using **Expo Go** or run the application on an Android/iOS emulator.

---

## 📁 Project Structure

```text
MineOS/
├── Backend/
├── application/
│   ├── web/
│   └── mobile/
├── docs/
└── README.md
```

---

## 🔄 Core Workflow

```text
Field Activity
      ↓
Incident / Inspection
      ↓
GPS + Evidence
      ↓
Violation
      ↓
Corrective Action
      ↓
Verification
      ↓
Compliance
      ↓
Alerts + Dashboard
```

---

## 👥 Roles

**Worker • Inspector • Safety Officer • Mine Manager • Corporate Officer • Regulator • Contractor • Admin**

---

## 🎯 Vision

> **From fragmented mine data to unified mining operations.**

MineOS aims to enable **safer, smarter and more accountable mining operations** through digital governance.

---


<div align="center">

### ⛏️ MineOS

**Safety • Compliance • GIS • Workforce**

</div>

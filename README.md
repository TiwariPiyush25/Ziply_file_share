# 📦 Ziply File Share

**Ziply File Share** is a fast, anonymous, privacy-focused file-sharing platform designed for seamless data transfer. Built using Express (Node.js) on the backend and React (Vite) on the frontend, Ziply allows users to upload single or multiple files, automatically compress bulk uploads into `.zip` archives, protect links with passwords, set auto-expiration limits, and monitor active transfers with real-time telemetry.

---

## ✨ Features

* **⚡ On-the-Fly Archiving:** Automatically bundles multiple uploaded files into a high-compression `.zip` package.
* **🔑 Password Protection:** Optional custom passwords for sensitive files.
* **⏳ Configurable Expiry:** Set custom self-destruct timers (`5m`, `15m`, `1h`, `1d`) or choose **Instant Self-Destruct** (1 Download Max).
* **📱 QR Code Sharing:** Instantly generates shareable 6-character alphanumeric codes and QR codes for effortless mobile pickup.
* **🧹 Automated Storage Cleanup:** Background worker automatically removes expired files and folders from the server disk.
* **📊 Live Telemetry Dashboard:** Track real-time active shares, download hits, transferred storage volume, and network sync latency with manual remote wipe controls.
* **🌓 Dark / Light Mode:** Fully responsive UI with animated glassmorphism styling and theme toggling.

---

## 🛠️ Tech Stack

### **Backend**

* **Node.js & Express** – REST API framework
* **Multer** – Disk storage and multipart form handling
* **Archiver** – Dynamic streaming `.zip` generation
* **Cors** – Cross-origin requests handling

### **Frontend**

* **React 18** – UI library
* **React Router DOM** – Client-side routing
* **qrcode.react** – Dynamic QR code generation
* **Native Web Audio API** – Sound effect triggers on drop

---

## 🚀 Getting Started

### **1. Prerequisites**

Ensure you have Node.js (v16 or higher) and npm installed on your machine.

### **2. Repository Setup**

Clone the repository and split into two terminal windows for **Backend** and **Frontend**:

```bash
git clone https://github.com/your-username/ziply-file-share.git
cd ziply-file-share

```

---

### **3. Backend Installation & Run**

```bash
# Navigate to the backend folder (if applicable, or root directory)
npm install express multer archiver cors

# Start the Node.js Express server
node server.js

```

> **Backend Port:** Runs by default on `http://localhost:5000`

---

### **4. Frontend Installation & Run**

```bash
# Navigate to the frontend folder
npm install react react-dom react-router-dom qrcode.react

# Start the development server (using Vite/React)
npm run dev

```

> **Frontend Port:** Runs by default on `http://localhost:5173`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/upload` | Upload single/multiple files, set password and expiry time. |
| `POST` | `/api/check-status/:code` | Validate 6-digit share code and check password status. |
| `POST` | `/api/download/:code` | Download file stream or dynamically generated `.zip` archive. |
| `GET` | `/api/telemetry` | Retrieve server metrics (active shares, download hits, storage volume). |
| `DELETE` | `/api/telemetry/:id` | Delete an active relay and remove disk files manually. |

---

## 📄 License

This project is open-source and available under the **MIT License**.

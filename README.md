# CORE

### Centralized Online Repository

CORE is a personal college study-material repository designed to organize subject resources in one simple, accessible place.

Instead of searching through scattered files, students can browse:

**Subject → Unit → File**

---

## ✨ Features

- 📚 Subject-based organization
- 📁 Nested folders for units and topics
- 📄 PDF and DOCX file support
- 🖼️ Image file support
- 📥 File viewing and downloading
- 📢 Admin announcements
- ⏱️ Automatic announcement expiration
- 🔐 Admin-only management
- 📱 Mobile-friendly interface
- ☁️ Cloud-based storage and database

---

## 🛠️ Technologies & Tools Used

- HTML
- CSS
- JavaScript
- Cloudflare Pages
- Cloudflare Workers
- Supabase
- Git & GitHub
- Isha — AI Assist.

---

## 🏗️ Architecture

CORE Frontend  
↓  
Cloudflare Pages  
↓  
Cloudflare Worker  
├── Authentication  
├── API  
└── File Operations  
↓  
Supabase  
├── Database  
└── Storage

---

## 📂 Repository Structure

CORE/  
├── index.html  
├── admin.html  
├── css/  
├── js/  
├── assets/  
└── README.md

---

## 🔐 Access

CORE provides separate experiences for:

### Viewer

- Browse subjects, folders, and files
- View supported files
- Download files
- Receive announcements

### Admin

- Create and manage folders
- Upload files
- Rename and delete items
- Create and delete announcements

---

## 📢 Announcements

Administrators can publish announcements for:

- 24 hours
- 48 hours

Expired announcements are automatically cleaned up when the announcement endpoint is accessed.

When there is no active announcement, CORE displays a default informational tip.

---

## 🎨 Credits

**M.N.V.V**  
**Isha*** — Development Partner

**2026**

*— With love, Varma*

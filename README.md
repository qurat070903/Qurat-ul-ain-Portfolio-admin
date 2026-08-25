# Qurat-ul-Ain Portfolio

A professional personal portfolio website with a secure admin panel that allows portfolio content to be updated without directly editing the source code.

The project is built using HTML, CSS, JavaScript, Node.js, Express.js, and Vercel Blob Storage. It is deployed on Vercel.

---

## 🚀 Live Project

**Portfolio:**  
https://qurat-ul-ain-portfolio-admin.vercel.app/

**Admin Panel:**  
https://qurat-ul-ain-portfolio-admin.vercel.app/admin

> Admin access requires the configured administrator password.

---

## 📌 Project Overview

This project is a dynamic personal portfolio website designed to showcase:

- Personal introduction
- About section
- Education / academics
- Professional experience
- Leadership experience
- Statistics
- Contact information
- Certifications and credentials
- Downloadable CV

The project also includes an **Admin Panel** that allows the administrator to update portfolio information without manually editing the website files.

---

## ✨ Features

### Portfolio Website

- Responsive personal portfolio
- Modern and professional UI
- Hero section
- About section
- Experience section
- Academic timeline
- Leadership section
- Certifications section
- Contact section
- CV generation and download
- Responsive navigation menu
- Scroll/reveal animations

### Admin Panel

The admin panel provides controls for updating:

- Hero section
- About section
- Statistics
- Experience
- Academic qualifications
- Leadership experience
- Contact information
- Certificates

### Certificate Management

Administrators can:

1. Add a new certificate
2. Upload certificate images
3. Enter certificate title
4. Enter issuing organization
5. Save the changes
6. Display the certificate on the public portfolio

Existing certificate images are stored locally, while newly uploaded certificate images are stored using **Vercel Blob Storage**.

---

## 🛠️ Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript
- Responsive Design

### Backend

- Node.js
- Express.js

### Storage

- JSON-based portfolio content
- Vercel Blob Storage for persistent cloud storage
- Vercel Blob for uploaded certificate images

### Deployment

- GitHub
- Vercel

### Other Tools

- Multer
- dotenv
- PDF generation utilities

---

## 📁 Project Structure

```text
qurat-ul-ain-portfolio-admin/
│
├── data/
│   └── content.json
│
├── public/
│   ├── css/
│   │   └── style.css
│   │
│   ├── js/
│   │   ├── script.js
│   │   └── admin.js
│   │
│   └── images/
│       └── certificates/
│           ├── Certificate-1.jpeg
│           ├── Certificate-2.jpeg
│           ├── Certificate-3.jpeg
│           ├── Certificate-4.jpeg
│           └── Certificate-5.jpeg
│
├── src/
│   └── utils/
│       └── cv-generator.js
│
├── views/
│   ├── index.html
│   └── admin.html
│
├── server.js
├── package.json
├── package-lock.json
├── .env
├── .gitignore
└── README.md

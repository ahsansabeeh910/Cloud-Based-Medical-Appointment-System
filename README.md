# 🏥 Cloud-Based Medical Appointment System

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)

A highly secure, full-stack medical appointment booking system built with the MERN stack. Designed with a robust **2-Tier Cloud Architecture** deployed on Amazon Web Services (AWS) for maximum security and scalability.

---

## ✨ Key Features

*   🔐 **Role-Based Authentication:** Secure, JWT-based login for both Patients and Doctors.
*   📅 **Smart Appointment Booking:** Dynamic time-slot selection preventing double-booking.
*   🩺 **Doctor & Patient Dashboards:** Dedicated portal views to manage upcoming and past appointments.
*   📄 **Cloud Prescription Uploads:** Doctors can instantly upload and attach PDF/Image prescriptions directly to patient records using **Amazon S3**.
*   🛡️ **Highly Secure Database:** Powered by a private, self-hosted MongoDB instance on an **AWS EC2** server, completely shielded from the public internet.

---

## 🏗️ Cloud Architecture

This project implements a professional **2-Tier Cloud Architecture** on AWS:

1.  **Tier 1 (Web Server):** An Ubuntu EC2 instance running the Node.js/Express backend and serving the Vite React frontend using Nginx.
2.  **Tier 2 (Database Server):** A dedicated, private Ubuntu EC2 instance running MongoDB. 
    *   *Security:* A strict AWS Security Group firewall blocks all public internet access to the database. It only allows port `27017` ingress traffic exclusively from the Web Server's internal private IP.
3.  **Storage (Amazon S3):** A secure S3 bucket integrated directly with the Node.js backend to handle seamless file uploads (prescriptions) using the AWS SDK.

---

## 🛠️ Technology Stack

*   **Frontend:** React (Vite), Vanilla CSS, React Router DOM, React Hot Toast
*   **Backend:** Node.js, Express.js, Mongoose, JSON Web Tokens (JWT), Multer
*   **Database:** MongoDB Community Edition (Self-Hosted on EC2)
*   **Cloud Services:** AWS EC2 (Compute), AWS S3 (Storage), AWS IAM (Security)

---

## 🚀 Local Development Setup

To run this project locally, you will need Node.js and an active MongoDB database.

### 1. Clone the repository
```bash
git clone https://github.com/ahsansabeeh910/Cloud-Based-Medical-Appointment-System.git
cd Cloud-Based-Medical-Appointment-System
```

### 2. Configure Environment Variables
Create a `.env` file in the `/server` directory and add the following keys:
```env
PORT=5000
MONGO_URI=mongodb+srv://<your-username>:<your-password>@cluster0...
JWT_SECRET=your_super_secret_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=your_s3_bucket_name
```

### 3. Start the Backend Server
```bash
cd server
npm install
npm run dev
```

### 4. Start the Frontend Application
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```

The application will be accessible at `http://localhost:5173`.

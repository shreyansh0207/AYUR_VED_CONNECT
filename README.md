# Ayurvedic Doctor Consultation Platform

## 📖 Project Overview

This project is a **basic but scalable platform** for Ayurvedic doctor consultations. The system allows users to:

- Discover doctors by specialization & availability
- Book, view, and manage consultations
- Cancel or reschedule appointments
- View appointment history and statuses

The platform is designed to be modular, scalable, and extendable with features for doctors and admins.

---

## 🚀 Features

### 👩‍⚕️ Doctor Discovery
- Search doctors by specialization and consultation mode (online/in-person)
- Filter and sort doctors (earliest availability first)

### 📅 Slot Booking
- Slot is **locked for 5 minutes** after selection
- Mock OTP confirmation step before finalizing booking
- If not confirmed in 5 minutes → slot becomes available again

### 🔄 Reschedule & Cancellation
- Users can reschedule/cancel only if **more than 24 hours** before appointment
- Cancelled/rescheduled slots become available for other users

### 📊 Appointment Dashboard
- View **upcoming & past** appointments
- Filter by status: `Booked`, `Completed`, `Cancelled`

---

## ⚙️ Tech Stack

- **Frontend**: React or Next.js (with Tailwind CSS + shadcn-ui)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL or MongoDB
- **Authentication**: JWT

---

## 🛠 Setup Instructions

### Prerequisites
- Node.js & npm installed ([Install with nvm](https://github.com/nvm-sh/nvm))
- PostgreSQL or MongoDB installed and running

### Steps
```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate into the project
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev



## 🚆 Railway Reservation Management System

A full-stack **Railway Reservation Web Application** built using **FastAPI (Python)** for the backend and **React.js (CRACO + Tailwind)** for the frontend.
It allows users to register, log in, book train tickets, manage bookings, and view train schedules.

---

### 🧩 Tech Stack

| Layer                | Technology                                                  |
| -------------------- | ----------------------------------------------------------- |
| **Frontend**         | React.js, CRACO, TailwindCSS                                |
| **Backend**          | FastAPI (Python), SQLite3                                   |
| **Authentication**   | JWT (JSON Web Tokens)                                       |
| **Password Hashing** | Bcrypt via Passlib                                          |
| **Data Structures**  | Custom Linked List & Queue for train and waiting list logic |

---

## ⚙️ Features

✅ User registration and login (JWT Auth)
✅ Admin dashboard for train management
✅ Book and cancel tickets
✅ Waiting list queue system
✅ Linked list structure for train storage
✅ Fully responsive web UI

---

## 🧰 Installation and Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/divyam007142/Railway-reservation.git
cd Railway-reservation
```

---

### 2️⃣ Backend Setup (FastAPI)

#### 📁 Navigate to backend folder

```bash
cd backend
```

#### 🐍 Create a virtual environment

```bash
python -m venv venv
venv\Scripts\activate
```

#### 📦 Install dependencies

```bash
pip install -r requirements.txt
```

If you don’t have `requirements.txt`, manually install:

```bash
pip install fastapi uvicorn passlib[bcrypt] python-jose sqlite3
```

#### 🧱 Initialize the database

Delete any corrupted database first:

```bash
del railway.db
```

Then automatically create all tables:

```bash
python -c "from database import init_database; init_database(); print('✅ Database initialized')"
```

---

### 3️⃣ Run Backend Server

```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

You should see:

```
INFO:     Application startup complete.
```

Then open in browser:
👉 [http://localhost:8001/docs](http://localhost:8001/docs)

**Default Admin Login:**

```
username: admin
password: admin123
```

---

### 4️⃣ Frontend Setup (React + CRACO)

#### 📁 Open a new terminal and go to frontend folder

```bash
cd ../frontend
```

#### 📦 Install dependencies

```bash
npm install --legacy-peer-deps
```

#### 🔗 Configure API base URL

Open `.env` or `src/api.js` and set:

```env
REACT_APP_API_URL=http://localhost:8001/api
```

#### ▶️ Start the frontend

```bash
npm start
```

The app will start at:
👉 [http://localhost:3000](http://localhost:3000)

---

## 🧠 Common Issues & Fixes

### ⚠️ CORS Error (Login / Signup fails)

If you see this error in console:

```
Access to XMLHttpRequest at 'https://...' has been blocked by CORS policy
```

Add this to your `server.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Then restart backend:

```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

---

### ⚠️ Database Disk Image Malformed

If this occurs:

```
sqlite3.DatabaseError: database disk image is malformed
```

Simply delete the file `railway.db` and rerun the backend — it will auto-create a new clean one.

---

### ⚠️ bcrypt version warning

If you see:

```
(trapped) error reading bcrypt version
```

Run:

```bash
pip install --upgrade bcrypt==4.1.2 passlib==1.7.4
```

---

## 🚀 Final Run Summary

| Command                                                 | Description                                                             |
| ------------------------------------------------------- | ----------------------------------------------------------------------- |
| `cd backend && uvicorn server:app --port 8001 --reload` | Start backend server                                                    |
| `cd frontend && npm start`                              | Start frontend (React app)                                              |
| URL                                                     | Frontend → [http://localhost:3000](http://localhost:3000)               |
| URL                                                     | Backend Docs → [http://localhost:8001/docs](http://localhost:8001/docs) |

---

## 👨‍💻 Author

**Divyam Singh**
💼 GitHub: [@divyam007142](https://github.com/divyam007142)
🌐 Project: [Railway Reservation System](https://github.com/divyam007142/Railway-reservation)

---

Would you like me to add badges (for Python, React, License, etc.) and screenshots sections to make it look even more **professional** like a showcase project?

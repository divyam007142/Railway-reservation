# Railway Reservation Management System

A comprehensive railway booking platform with **Terminal-Based** and **Web-Based** versions, featuring modern UI design, JWT authentication, and efficient data structure implementations.

## Features

### Core Functionalities
- **Authentication System**: JWT-based login/registration with Admin and Passenger roles
- **Train Management**: CRUD operations for trains (Admin only)
- **Smart Booking System**: Auto-PNR generation, seat allocation
- **Waiting List Queue**: Automatic promotion when seats become available
- **Real-time Updates**: Seat availability updates
- **PNR Status Check**: Track booking status

### Data Structures
- **Linked Lists**: For managing train records
- **Queues**: For waiting list management
- **Dictionaries**: For passenger and train information

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLite**: Lightweight database
- **Pydantic**: Data validation
- **JWT**: Token-based authentication
- **Bcrypt**: Password hashing

### Frontend
- **React**: UI library
- **Tailwind CSS**: Styling
- **Shadcn UI**: Component library
- **Axios**: HTTP client
- **React Router**: Navigation

## Getting Started

### Terminal Version

Run the terminal-based application:

```bash
cd /app/backend
python3 terminal_app.py
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

**Terminal Features:**
- Login/Register
- Search trains by route, source, destination
- Book tickets with auto-PNR generation
- View bookings
- Cancel tickets
- Admin: Add/Delete trains, view all bookings, system reports

### Web Application

The web app is already running:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001

**Default Admin Login:**
- Username: `admin`
- Password: `admin123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Trains
- `GET /api/trains` - Get all trains
- `GET /api/trains/search` - Search trains
- `POST /api/trains` - Create train (Admin)
- `PUT /api/trains/{id}` - Update train (Admin)
- `DELETE /api/trains/{id}` - Delete train (Admin)

### Bookings
- `POST /api/bookings` - Book ticket or join waiting list
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/pnr/{pnr}` - Get booking by PNR
- `DELETE /api/bookings/{pnr}` - Cancel booking

## Design Highlights

### UI/UX Features
- **Glass-morphism design**: Modern frosted glass effects
- **Gradient backgrounds**: Soft pastel colors
- **Smooth animations**: Hover effects, transitions
- **Responsive layout**: Works on all screen sizes
- **Space Grotesk & Inter fonts**: Modern typography

**Built with ❤️ using Python, React, and modern web technologies**

# Railway Reservation System - Usage Guide

## Quick Start

### 🌐 Web Application (Already Running)
- **URL**: http://localhost:3000
- **Default Admin**: Username: `admin`, Password: `admin123`

### 💻 Terminal Application
```bash
cd /app/backend
python3 terminal_app.py
```

---

## Web Application Features

### 🔐 Login Page
- **Glass-morphism design** with custom styling
- Switch between Login and Register tabs
- Password visibility toggle
- Remember me option

### 👨‍💼 Admin Dashboard

#### Overview Tab
- **Total Trains**: Number of trains in system
- **Total Bookings**: Confirmed bookings count
- **Total Passengers**: Registered users
- **Waiting List**: Current waiting passengers
- **Seat Statistics**: Visual progress bars showing:
  - Total seats across all trains
  - Booked seats
  - Available seats
- **Recent Bookings**: Last 5 bookings with status

#### Trains Tab
- View all trains in a table
- See train number, name, route, seats, fare, departure time
- Delete trains (with confirmation)
- Real-time seat availability shown as `Available/Total`

#### Bookings Tab
- View all bookings from all users
- See PNR, username, train details, passenger info, seat, status, date
- Track confirmed and cancelled bookings

#### Add Train Tab
- Form to add new trains
- Fields:
  - Train Number (unique)
  - Train Name
  - Source Station
  - Destination Station
  - Total Seats (number)
  - Fare (in ₹)
  - Departure Time (optional)
  - Arrival Time (optional)
- Success notification on submission

### 🎫 Passenger Dashboard

#### Search Trains Tab
- Search by source and/or destination
- View all available trains with:
  - Train name and number
  - Route (source → destination)
  - Departure and arrival times
  - Available seats (real-time)
  - Fare
- **Book Now** button (green) for available trains
- **Join Waiting List** button (orange) for full trains

#### My Bookings Tab
- View all your bookings in card format
- Each booking shows:
  - PNR number (large, bold)
  - Status badge (confirmed/cancelled)
  - Train name and number
  - Passenger name
  - Seat number
  - Route
  - Fare
- **Cancel Booking** button for confirmed tickets

#### PNR Status Tab
- Enter PNR number to check status
- Displays complete booking details:
  - PNR and status
  - Train details
  - Passenger information
  - Route
  - Seat number
  - Fare amount
  - Booking date and time

---

## Terminal Application Features

### Main Menu
1. **Login** - Login with existing credentials
2. **Register** - Create new passenger account
3. **Exit** - Close application

### Admin Menu (after login as admin)
1. **Add New Train** - Insert train into linked list
2. **View All Trains** - Display all trains from linked list
3. **Search Trains** - Search by train number, source, destination, or route
4. **Delete Train** - Remove train from linked list
5. **View All Bookings** - See all system bookings
6. **View Waiting Lists** - Display waiting queues for each train
7. **System Summary** - Show statistics:
   - Total trains, passengers, bookings
   - Seat statistics
   - Waiting list count
8. **Logout** - Return to main menu

### Passenger Menu
1. **Search Trains** - Find trains by route/source/destination
2. **View All Trains** - List all available trains
3. **Book Ticket** - Book ticket or join waiting list
   - Select train from list
   - Enter passenger details (name, age, gender, phone)
   - Get PNR if confirmed or waiting list position
4. **View My Bookings** - Display your booking history
5. **Cancel Ticket** - Cancel booking by PNR
   - Automatically promotes waiting list passenger
   - Updates seat availability
6. **Logout** - Return to main menu

---

## Data Structure Operations

### Linked List (Train Management)
```python
# When admin adds a train
trains_list.insert_at_end(train_data)

# When searching for trains
train = trains_list.search(train_number, compare_function)

# When deleting a train
trains_list.delete_by_value(train_number, compare_function)

# When updating train details
trains_list.update(train_id, updated_data, compare_function)
```

### Queue (Waiting List Management)
```python
# When train is full, add to waiting list
waiting_queue.enqueue(passenger_data)

# When ticket is cancelled, promote from waiting list
first_passenger = waiting_queue.dequeue()

# Check waiting list position
position = waiting_queue.size()
```

---

## Booking Flow

### Successful Booking (Seats Available)
1. Passenger selects train
2. Fills passenger details
3. System generates unique PNR (10 characters)
4. Assigns seat number
5. Updates available seats
6. Saves to database
7. Returns booking confirmation

### Waiting List (No Seats)
1. Passenger selects full train
2. Fills passenger details
3. System adds to waiting queue
4. Assigns position number
5. Returns waiting list confirmation

### Cancellation & Auto-Promotion
1. Passenger cancels booking
2. System marks booking as cancelled
3. Checks waiting list queue
4. If queue has passengers:
   - Dequeues first passenger (FIFO)
   - Generates new PNR
   - Assigns cancelled seat
   - Saves new booking
   - Updates waiting list positions
5. If queue is empty:
   - Increases available seats

---

## API Testing Examples

### Register User
```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123",
    "full_name": "Test User",
    "email": "test@example.com"
  }'
```

### Login
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Search Trains
```bash
curl "http://localhost:8001/api/trains/search?source=Delhi&destination=Mumbai"
```

### Book Ticket (with token)
```bash
curl -X POST http://localhost:8001/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "train_id": 1,
    "passenger_name": "John Doe",
    "passenger_age": 30,
    "passenger_gender": "M",
    "passenger_phone": "9876543210"
  }'
```

### Check PNR Status
```bash
curl http://localhost:8001/api/bookings/pnr/ABC123XYZ
```

---

## Design Features

### Color Scheme
- **Primary Blue**: #1e40af (buttons, headings, train numbers)
- **Success Green**: #059669 (available seats, confirmations)
- **Warning Orange**: #ea580c (waiting list)
- **Danger Red**: #dc2626 (cancellations, full trains)
- **Background**: Soft gradient (blue-pink-orange pastels)

### Typography
- **Headings**: Space Grotesk (modern, geometric)
- **Body Text**: Inter (clean, readable)
- **Icons**: Remix Icons

### UI Elements
- **Glass-morphism**: Frosted glass effect with backdrop blur
- **Smooth Animations**: Hover effects, transitions
- **Responsive Cards**: Card hover effects with shadow
- **Progress Bars**: Visual seat statistics
- **Badges**: Status indicators (confirmed, cancelled, waiting)

---

## Tips & Best Practices

1. **Always check seat availability** before booking
2. **Note your PNR** immediately after booking
3. **Use search filters** to find trains quickly
4. **Admin should monitor** waiting lists regularly
5. **Cancel early** if you can't travel (helps waiting passengers)
6. **Terminal app** is great for quick operations
7. **Web app** provides better visualization and UX

---

## Troubleshooting

### Web app not loading?
```bash
sudo supervisorctl status frontend
sudo supervisorctl restart frontend
```

### Backend API errors?
```bash
sudo supervisorctl status backend
tail -f /var/log/supervisor/backend.err.log
```

### Database issues?
```bash
cd /app/backend
# Database will auto-create on first run
python3 -c "from database import init_database; init_database()"
```

### Terminal app issues?
```bash
cd /app/backend
python3 terminal_app.py
# Check for syntax errors or missing dependencies
```

---

## Sample Data

The system comes pre-configured with:
- **1 Admin User**: admin/admin123
- **4 Sample Trains**:
  - Rajdhani Express: Delhi → Mumbai (100 seats, ₹1500)
  - Shatabdi Express: Chennai → Bangalore (80 seats, ₹800)
  - Duronto Express: Kolkata → Delhi (120 seats, ₹2000)
  - Garib Rath: Mumbai → Ahmedabad (60 seats, ₹600)

You can add more trains via admin dashboard or terminal app!

---

**Enjoy your Railway Reservation System! 🚂**

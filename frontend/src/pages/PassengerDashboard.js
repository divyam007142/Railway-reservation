import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PassengerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trains, setTrains] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState({ source: '', destination: '' });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [pnrSearch, setPnrSearch] = useState('');
  const [pnrResult, setPnrResult] = useState(null);
  
  const [bookingForm, setBookingForm] = useState({
    passenger_name: '',
    passenger_age: '',
    passenger_gender: 'M',
    passenger_phone: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
      navigate('/');
      return;
    }
    
    setUser(userData);
    loadAllTrains();
    loadMyBookings();
  }, [navigate]);

  const loadAllTrains = async () => {
    try {
      const response = await axios.get(`${API}/trains`);
      setTrains(response.data);
    } catch (error) {
      toast.error('Failed to load trains');
    }
  };

  const loadMyBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyBookings(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/');
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.source && !searchQuery.destination) {
      loadAllTrains();
      return;
    }
    
    try {
      const params = new URLSearchParams();
      if (searchQuery.source) params.append('source', searchQuery.source);
      if (searchQuery.destination) params.append('destination', searchQuery.destination);
      
      const response = await axios.get(`${API}/trains/search?${params.toString()}`);
      setTrains(response.data);
      
      if (response.data.length === 0) {
        toast.info('No trains found for this route');
      }
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handlePNRSearch = async () => {
    if (!pnrSearch.trim()) {
      toast.error('Please enter PNR number');
      return;
    }
    
    try {
      const response = await axios.get(`${API}/bookings/pnr/${pnrSearch.trim()}`);
      setPnrResult(response.data);
      toast.success('Booking found!');
    } catch (error) {
      setPnrResult(null);
      toast.error('Booking not found');
    }
  };

  const handleBookTicket = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/bookings`, {
        train_id: selectedTrain.id,
        ...bookingForm,
        passenger_age: parseInt(bookingForm.passenger_age)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.status === 'confirmed') {
        toast.success(`Ticket booked! PNR: ${response.data.pnr}`);
      } else {
        toast.info(`Added to waiting list. Position: ${response.data.position}`);
      }
      
      setShowBookingDialog(false);
      setBookingForm({
        passenger_name: '',
        passenger_age: '',
        passenger_gender: 'M',
        passenger_phone: ''
      });
      loadAllTrains();
      loadMyBookings();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (pnr) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API}/bookings/${pnr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(response.data.message);
      loadMyBookings();
      loadAllTrains();
    } catch (error) {
      toast.error('Cancellation failed');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    toast.info('Logged out successfully');
  };

  const openBookingDialog = (train) => {
    if (train.available_seats === 0) {
      if (window.confirm('No seats available. Do you want to join waiting list?')) {
        setSelectedTrain(train);
        setShowBookingDialog(true);
      }
    } else {
      setSelectedTrain(train);
      setShowBookingDialog(true);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #e8f4f8 0%, #f0e8f4 50%, #fef3e8 100%)' }}>
      {/* Header */}
      <div className="glass" style={{ 
        padding: '20px 40px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(12px)'
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="ri-train-fill text-3xl" style={{ color: '#1e40af' }}></i>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#1e293b' }}>Railway Booking</h1>
              <p className="text-sm" style={{ color: '#64748b' }}>Welcome, {user.full_name}</p>
            </div>
          </div>
          <Button data-testid="logout-btn" onClick={handleLogout} variant="outline" style={{ 
            borderRadius: '20px',
            padding: '10px 24px'
          }}>
            <i className="ri-logout-box-r-line mr-2"></i>
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 glass p-2 rounded-xl">
            <TabsTrigger data-testid="search-trains-tab" value="search" className="rounded-lg">Search Trains</TabsTrigger>
            <TabsTrigger data-testid="my-bookings-tab" value="bookings" className="rounded-lg">My Bookings</TabsTrigger>
            <TabsTrigger data-testid="pnr-status-tab" value="pnr" className="rounded-lg">PNR Status</TabsTrigger>
          </TabsList>

          {/* Search Trains Tab */}
          <TabsContent value="search" className="fade-in">
            <div className="glass p-6 rounded-2xl mb-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#1e293b' }}>Search Trains</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <input
                    data-testid="search-source-input"
                    type="text"
                    placeholder="From (Source)"
                    value={searchQuery.source}
                    onChange={(e) => setSearchQuery({ ...searchQuery, source: e.target.value })}
                    className="w-full p-3 rounded-xl"
                    style={{ background: 'rgba(255, 255, 255, 0.5)', border: '2px solid rgba(255, 255, 255, 0.3)' }}
                  />
                </div>
                <div>
                  <input
                    data-testid="search-destination-input"
                    type="text"
                    placeholder="To (Destination)"
                    value={searchQuery.destination}
                    onChange={(e) => setSearchQuery({ ...searchQuery, destination: e.target.value })}
                    className="w-full p-3 rounded-xl"
                    style={{ background: 'rgba(255, 255, 255, 0.5)', border: '2px solid rgba(255, 255, 255, 0.3)' }}
                  />
                </div>
                <Button
                  data-testid="search-trains-btn"
                  onClick={handleSearch}
                  style={{
                    background: '#1e40af',
                    color: 'white',
                    borderRadius: '12px',
                    padding: '12px 24px'
                  }}
                >
                  <i className="ri-search-line mr-2"></i>
                  Search
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {trains.length === 0 ? (
                <div className="glass p-12 rounded-2xl text-center">
                  <i className="ri-train-line text-6xl mb-4" style={{ color: '#cbd5e1' }}></i>
                  <p style={{ color: '#64748b' }}>No trains available</p>
                </div>
              ) : (
                trains.map((train) => (
                  <div key={train.id} data-testid={`train-card-${train.id}`} className="glass card-hover p-6 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-xl font-bold" style={{ color: '#1e40af' }}>{train.train_name}</h3>
                          <span className="badge badge-info">{train.train_number}</span>
                        </div>
                        
                        <div className="flex items-center gap-6 mt-3">
                          <div>
                            <p className="text-sm" style={{ color: '#64748b' }}>From</p>
                            <p className="font-semibold" style={{ color: '#1e293b' }}>{train.source}</p>
                            <p className="text-sm" style={{ color: '#64748b' }}>{train.departure_time || 'N/A'}</p>
                          </div>
                          
                          <i className="ri-arrow-right-line text-2xl" style={{ color: '#cbd5e1' }}></i>
                          
                          <div>
                            <p className="text-sm" style={{ color: '#64748b' }}>To</p>
                            <p className="font-semibold" style={{ color: '#1e293b' }}>{train.destination}</p>
                            <p className="text-sm" style={{ color: '#64748b' }}>{train.arrival_time || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm" style={{ color: '#64748b' }}>Available Seats</p>
                          <p className="text-2xl font-bold" style={{ 
                            color: train.available_seats === 0 ? '#dc2626' : '#059669' 
                          }}>
                            {train.available_seats}/{train.total_seats}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm" style={{ color: '#64748b' }}>Fare</p>
                          <p className="text-2xl font-bold" style={{ color: '#1e40af' }}>₹{train.fare}</p>
                        </div>
                        
                        <Button
                          data-testid={`book-train-${train.id}-btn`}
                          onClick={() => openBookingDialog(train)}
                          style={{
                            background: train.available_seats === 0 ? '#ea580c' : '#059669',
                            color: 'white',
                            borderRadius: '12px',
                            padding: '12px 24px'
                          }}
                        >
                          {train.available_seats === 0 ? 'Join Waiting List' : 'Book Now'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* My Bookings Tab */}
          <TabsContent value="bookings" className="fade-in">
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#1e293b' }}>My Bookings</h3>
              
              {myBookings.length === 0 ? (
                <div className="text-center py-12">
                  <i className="ri-ticket-2-line text-6xl mb-4" style={{ color: '#cbd5e1' }}></i>
                  <p style={{ color: '#64748b' }}>No bookings yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myBookings.map((booking) => (
                    <div key={booking.id} data-testid={`booking-card-${booking.pnr}`} className="card-hover p-6 rounded-xl" style={{ 
                      background: 'rgba(255, 255, 255, 0.4)',
                      border: '2px solid rgba(255, 255, 255, 0.5)'
                    }}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm" style={{ color: '#64748b' }}>PNR Number</p>
                          <p className="text-xl font-bold" style={{ color: '#1e40af' }}>{booking.pnr}</p>
                        </div>
                        <span className={`badge ${
                          booking.booking_status === 'confirmed' ? 'badge-success' : 'badge-danger'
                        }`}>
                          {booking.booking_status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span style={{ color: '#64748b' }}>Train:</span>
                          <span className="font-semibold">{booking.train_name} ({booking.train_number})</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: '#64748b' }}>Passenger:</span>
                          <span className="font-semibold">{booking.passenger_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: '#64748b' }}>Seat:</span>
                          <span className="font-semibold">{booking.seat_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: '#64748b' }}>Route:</span>
                          <span className="font-semibold">{booking.source} → {booking.destination}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: '#64748b' }}>Fare:</span>
                          <span className="font-semibold">₹{booking.fare}</span>
                        </div>
                      </div>
                      
                      {booking.booking_status === 'confirmed' && (
                        <Button
                          data-testid={`cancel-booking-${booking.pnr}-btn`}
                          variant="destructive"
                          className="w-full"
                          onClick={() => handleCancelBooking(booking.pnr)}
                          style={{ borderRadius: '10px' }}
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* PNR Status Tab */}
          <TabsContent value="pnr" className="fade-in">
            <div className="max-w-2xl mx-auto">
              <div className="glass p-8 rounded-2xl mb-6">
                <h3 className="text-xl font-bold mb-6" style={{ color: '#1e293b' }}>Check PNR Status</h3>
                <div className="flex gap-4">
                  <input
                    data-testid="pnr-search-input"
                    type="text"
                    placeholder="Enter PNR Number"
                    value={pnrSearch}
                    onChange={(e) => setPnrSearch(e.target.value.toUpperCase())}
                    className="flex-1 p-3 rounded-xl"
                    style={{ background: 'rgba(255, 255, 255, 0.5)', border: '2px solid rgba(255, 255, 255, 0.3)' }}
                  />
                  <Button
                    data-testid="check-pnr-btn"
                    onClick={handlePNRSearch}
                    style={{
                      background: '#1e40af',
                      color: 'white',
                      borderRadius: '12px',
                      padding: '12px 32px'
                    }}
                  >
                    Check Status
                  </Button>
                </div>
              </div>

              {pnrResult && (
                <div data-testid="pnr-result-card" className="glass p-8 rounded-2xl fade-in">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-sm" style={{ color: '#64748b' }}>PNR Number</p>
                      <p className="text-2xl font-bold" style={{ color: '#1e40af' }}>{pnrResult.pnr}</p>
                    </div>
                    <span className={`badge ${
                      pnrResult.booking_status === 'confirmed' ? 'badge-success' : 'badge-danger'
                    }`}>
                      {pnrResult.booking_status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm mb-2" style={{ color: '#64748b' }}>Train Details</p>
                      <p className="font-semibold mb-1">{pnrResult.train_name}</p>
                      <p className="text-sm" style={{ color: '#64748b' }}>{pnrResult.train_number}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm mb-2" style={{ color: '#64748b' }}>Passenger</p>
                      <p className="font-semibold mb-1">{pnrResult.passenger_name}</p>
                      <p className="text-sm" style={{ color: '#64748b' }}>{pnrResult.passenger_age} years, {pnrResult.passenger_gender}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm mb-2" style={{ color: '#64748b' }}>Route</p>
                      <p className="font-semibold">{pnrResult.source} → {pnrResult.destination}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm mb-2" style={{ color: '#64748b' }}>Seat Number</p>
                      <p className="font-semibold text-2xl" style={{ color: '#059669' }}>{pnrResult.seat_number}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm mb-2" style={{ color: '#64748b' }}>Fare</p>
                      <p className="font-semibold text-xl">₹{pnrResult.fare}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm mb-2" style={{ color: '#64748b' }}>Booking Date</p>
                      <p className="font-semibold">{new Date(pnrResult.booking_date).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="glass" style={{ maxWidth: '500px', borderRadius: '20px' }}>
          <DialogHeader>
            <DialogTitle style={{ fontSize: '24px', color: '#1e293b' }}>Book Ticket</DialogTitle>
            {selectedTrain && (
              <div className="mt-2">
                <p className="font-semibold" style={{ color: '#1e40af' }}>{selectedTrain.train_name}</p>
                <p className="text-sm" style={{ color: '#64748b' }}>
                  {selectedTrain.source} → {selectedTrain.destination}
                </p>
              </div>
            )}
          </DialogHeader>
          
          <form onSubmit={handleBookTicket} data-testid="booking-form" className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#475569' }}>Passenger Name</label>
              <input
                data-testid="passenger-name-input"
                type="text"
                required
                value={bookingForm.passenger_name}
                onChange={(e) => setBookingForm({ ...bookingForm, passenger_name: e.target.value })}
                className="w-full p-3 rounded-xl"
                style={{ background: 'rgba(255, 255, 255, 0.5)', border: '2px solid rgba(255, 255, 255, 0.3)' }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#475569' }}>Age</label>
                <input
                  data-testid="passenger-age-input"
                  type="number"
                  required
                  value={bookingForm.passenger_age}
                  onChange={(e) => setBookingForm({ ...bookingForm, passenger_age: e.target.value })}
                  className="w-full p-3 rounded-xl"
                  style={{ background: 'rgba(255, 255, 255, 0.5)', border: '2px solid rgba(255, 255, 255, 0.3)' }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#475569' }}>Gender</label>
                <select
                  data-testid="passenger-gender-select"
                  value={bookingForm.passenger_gender}
                  onChange={(e) => setBookingForm({ ...bookingForm, passenger_gender: e.target.value })}
                  className="w-full p-3 rounded-xl"
                  style={{ background: 'rgba(255, 255, 255, 0.5)', border: '2px solid rgba(255, 255, 255, 0.3)' }}
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#475569' }}>Phone Number</label>
              <input
                data-testid="passenger-phone-input"
                type="tel"
                required
                value={bookingForm.passenger_phone}
                onChange={(e) => setBookingForm({ ...bookingForm, passenger_phone: e.target.value })}
                className="w-full p-3 rounded-xl"
                style={{ background: 'rgba(255, 255, 255, 0.5)', border: '2px solid rgba(255, 255, 255, 0.3)' }}
              />
            </div>
            
            <Button
              data-testid="submit-booking-btn"
              type="submit"
              disabled={loading}
              className="w-full"
              style={{
                background: '#1e40af',
                color: 'white',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              {loading ? 'Booking...' : selectedTrain?.available_seats === 0 ? 'Join Waiting List' : 'Confirm Booking'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PassengerDashboard;

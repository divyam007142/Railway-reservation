import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trains, setTrains] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [trainForm, setTrainForm] = useState({
    train_number: '',
    train_name: '',
    source: '',
    destination: '',
    total_seats: '',
    fare: '',
    departure_time: '',
    arrival_time: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || userData.role !== 'admin') {
      navigate('/');
      return;
    }
    
    setUser(userData);
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [trainsRes, bookingsRes, summaryRes] = await Promise.all([
        axios.get(`${API}/trains`, { headers }),
        axios.get(`${API}/bookings/all`, { headers }),
        axios.get(`${API}/reports/summary`, { headers })
      ]);
      
      setTrains(trainsRes.data);
      setBookings(bookingsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/');
      } else {
        toast.error('Failed to load data');
      }
    }
  };

  const handleAddTrain = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/trains`, {
        ...trainForm,
        total_seats: parseInt(trainForm.total_seats),
        fare: parseFloat(trainForm.fare)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Train added successfully');
      setTrainForm({
        train_number: '',
        train_name: '',
        source: '',
        destination: '',
        total_seats: '',
        fare: '',
        departure_time: '',
        arrival_time: ''
      });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add train');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrain = async (trainId) => {
    if (!window.confirm('Are you sure you want to delete this train?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/trains/${trainId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Train deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete train');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    toast.info('Logged out successfully');
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
              <h1 className="text-2xl font-bold" style={{ color: '#1e293b' }}>Admin Dashboard</h1>
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
          <TabsList className="grid w-full grid-cols-4 mb-6 glass p-2 rounded-xl">
            <TabsTrigger data-testid="overview-tab" value="overview" className="rounded-lg">Overview</TabsTrigger>
            <TabsTrigger data-testid="trains-tab" value="trains" className="rounded-lg">Trains</TabsTrigger>
            <TabsTrigger data-testid="bookings-tab" value="bookings" className="rounded-lg">Bookings</TabsTrigger>
            <TabsTrigger data-testid="add-train-tab" value="add-train" className="rounded-lg">Add Train</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div data-testid="total-trains-card" className="glass card-hover p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: '#64748b' }}>Total Trains</p>
                    <h3 className="text-3xl font-bold mt-2" style={{ color: '#1e40af' }}>{summary?.total_trains || 0}</h3>
                  </div>
                  <i className="ri-train-line text-4xl" style={{ color: '#1e40af', opacity: 0.3 }}></i>
                </div>
              </div>
              
              <div data-testid="total-bookings-card" className="glass card-hover p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: '#64748b' }}>Total Bookings</p>
                    <h3 className="text-3xl font-bold mt-2" style={{ color: '#059669' }}>{summary?.total_bookings || 0}</h3>
                  </div>
                  <i className="ri-ticket-2-line text-4xl" style={{ color: '#059669', opacity: 0.3 }}></i>
                </div>
              </div>
              
              <div data-testid="total-passengers-card" className="glass card-hover p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: '#64748b' }}>Total Passengers</p>
                    <h3 className="text-3xl font-bold mt-2" style={{ color: '#dc2626' }}>{summary?.total_passengers || 0}</h3>
                  </div>
                  <i className="ri-user-line text-4xl" style={{ color: '#dc2626', opacity: 0.3 }}></i>
                </div>
              </div>
              
              <div data-testid="waiting-list-card" className="glass card-hover p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: '#64748b' }}>Waiting List</p>
                    <h3 className="text-3xl font-bold mt-2" style={{ color: '#ea580c' }}>{summary?.waiting_count || 0}</h3>
                  </div>
                  <i className="ri-time-line text-4xl" style={{ color: '#ea580c', opacity: 0.3 }}></i>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-4" style={{ color: '#1e293b' }}>Seat Statistics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span style={{ color: '#64748b' }}>Total Seats</span>
                      <span className="font-semibold">{summary?.total_seats || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-blue-600 h-3 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span style={{ color: '#64748b' }}>Booked Seats</span>
                      <span className="font-semibold">{summary?.booked_seats || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-green-600 h-3 rounded-full" 
                           style={{ width: `${(summary?.booked_seats / summary?.total_seats * 100) || 0}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span style={{ color: '#64748b' }}>Available Seats</span>
                      <span className="font-semibold">{summary?.available_seats || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-orange-600 h-3 rounded-full" 
                           style={{ width: `${(summary?.available_seats / summary?.total_seats * 100) || 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-4" style={{ color: '#1e293b' }}>Recent Bookings</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {summary?.recent_bookings?.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-white/30 rounded-xl">
                      <div>
                        <p className="font-semibold" style={{ color: '#1e293b' }}>{booking.pnr}</p>
                        <p className="text-sm" style={{ color: '#64748b' }}>{booking.train_name}</p>
                      </div>
                      <span className={`badge ${booking.booking_status === 'confirmed' ? 'badge-success' : 'badge-danger'}`}>
                        {booking.booking_status}
                      </span>
                    </div>
                  )) || <p style={{ color: '#64748b' }}>No recent bookings</p>}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Trains Tab */}
          <TabsContent value="trains" className="fade-in">
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#1e293b' }}>All Trains</h3>
              <div className="overflow-x-auto">
                <table data-testid="trains-table">
                  <thead>
                    <tr>
                      <th>Train #</th>
                      <th>Name</th>
                      <th>Route</th>
                      <th>Seats</th>
                      <th>Fare</th>
                      <th>Departure</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trains.map((train) => (
                      <tr key={train.id}>
                        <td className="font-semibold" style={{ color: '#1e40af' }}>{train.train_number}</td>
                        <td>{train.train_name}</td>
                        <td>
                          <span style={{ color: '#64748b' }}>{train.source}</span>
                          <i className="ri-arrow-right-line mx-2"></i>
                          <span style={{ color: '#64748b' }}>{train.destination}</span>
                        </td>
                        <td>
                          <span className={train.available_seats === 0 ? 'text-red-600' : 'text-green-600'}>
                            {train.available_seats}/{train.total_seats}
                          </span>
                        </td>
                        <td>₹{train.fare}</td>
                        <td>{train.departure_time || 'N/A'}</td>
                        <td>
                          <Button
                            data-testid={`delete-train-${train.id}-btn`}
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteTrain(train.id)}
                            style={{ borderRadius: '8px' }}
                          >
                            <i className="ri-delete-bin-line"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="fade-in">
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#1e293b' }}>All Bookings</h3>
              <div className="overflow-x-auto">
                <table data-testid="bookings-table">
                  <thead>
                    <tr>
                      <th>PNR</th>
                      <th>User</th>
                      <th>Train</th>
                      <th>Passenger</th>
                      <th>Seat</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="font-semibold" style={{ color: '#1e40af' }}>{booking.pnr}</td>
                        <td>{booking.username}</td>
                        <td>{booking.train_name} ({booking.train_number})</td>
                        <td>{booking.passenger_name}</td>
                        <td>{booking.seat_number}</td>
                        <td>
                          <span className={`badge ${
                            booking.booking_status === 'confirmed' ? 'badge-success' : 'badge-danger'
                          }`}>
                            {booking.booking_status}
                          </span>
                        </td>
                        <td>{new Date(booking.booking_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Add Train Tab */}
          <TabsContent value="add-train" className="fade-in">
            <div className="max-w-2xl mx-auto glass p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-6" style={{ color: '#1e293b' }}>Add New Train</h3>
              <form onSubmit={handleAddTrain} data-testid="add-train-form" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#475569' }}>Train Number</label>
                    <input
                      data-testid="train-number-input"
                      type="text"
                      required
                      value={trainForm.train_number}
                      onChange={(e) => setTrainForm({ ...trainForm, train_number: e.target.value })}
                      className="w-full p-3 rounded-xl"
                      style={{ background: 'rgba(255, 255, 255, 0.5)', border: '2px solid rgba(255, 255, 255, 0.3)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#475569' }}>Train Name</label>
                    <input
                      data-testid="train-name-input"
                      type="text"
                      required
                      value={trainForm.train_name}
                      onChange={(e) => setTrainForm({ ...trainForm, train_name: e.target.value })}
                      className="w-full p-3 rounded-xl"
                      style={{ background: 'rgba(255, 255, 255, 0.5)', border: '2px solid rgba(255, 255, 255, 0.3)' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#475569' }}>Source</label>
                    <input
                      data-testid="train-source-input"
                      type="text"
                      required
                      value={trainForm.source}
                      onChange={(e) => setTrainForm({ ...trainForm, source: e.target.value })}
                      className="w-full p-3 rounded-xl"
                      style={{ background: 'rgba(255, 255, 255, 0.5)', border: '2px solid rgba(255, 255, 255, 0.3)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#475569' }}>Destination</label>
                    <input
                      data-testid="train-destination-input"
                      type="text"
                      required
                      value={trainForm.destination}
                      onChange={(e) => setTrainForm({ ...trainForm, destination: e.target.value })}
                      className="w-full p-3 rounded-xl"
                      style={{ background: 'rgba(255, 255, 255, 0.5)', border: '2px solid rgba(255, 255, 255, 0.3)' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#475569' }}>Total Seats</label>
                    <input
                      data-testid="train-seats-input"
                      type="number"
                      required
                      value={trainForm.total_seats}
                      onChange={(e) => setTrainForm({ ...trainForm, total_seats: e.target.value })}
                      className="w-full p-3 rounded-xl"
                      style={{ background: 'rgba(255, 255, 255, 0.5)', border: '2px solid rgba(255, 255, 255, 0.3)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#475569' }}>Fare (₹)</label>
                    <input
                      data-testid="train-fare-input"
                      type="number"
                      step="0.01"
                      required
                      value={trainForm.fare}
                      onChange={(e) => setTrainForm({ ...trainForm, fare: e.target.value })}
                      className="w-full p-3 rounded-xl"
                      style={{ background: 'rgba(255, 255, 255, 0.5)', border: '2px solid rgba(255, 255, 255, 0.3)' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#475569' }}>Departure Time</label>
                    <input
                      data-testid="train-departure-input"
                      type="time"
                      value={trainForm.departure_time}
                      onChange={(e) => setTrainForm({ ...trainForm, departure_time: e.target.value })}
                      className="w-full p-3 rounded-xl"
                      style={{ background: 'rgba(255, 255, 255, 0.5)', border: '2px solid rgba(255, 255, 255, 0.3)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#475569' }}>Arrival Time</label>
                    <input
                      data-testid="train-arrival-input"
                      type="time"
                      value={trainForm.arrival_time}
                      onChange={(e) => setTrainForm({ ...trainForm, arrival_time: e.target.value })}
                      className="w-full p-3 rounded-xl"
                      style={{ background: 'rgba(255, 255, 255, 0.5)', border: '2px solid rgba(255, 255, 255, 0.3)' }}
                    />
                  </div>
                </div>

                <Button
                  data-testid="submit-train-btn"
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
                  {loading ? 'Adding Train...' : 'Add Train'}
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

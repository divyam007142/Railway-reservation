import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    email: '',
    phone: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/auth/login`, loginData);
      
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast.success(`Welcome back, ${response.data.user.full_name}!`);
      
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/passenger');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (registerData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const { confirmPassword, ...dataToSend } = registerData;
      await axios.post(`${API}/auth/register`, dataToSend);
      
      toast.success('Registration successful! Please login.');
      setIsLogin(true);
      setRegisterData({
        username: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        email: '',
        phone: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center" 
         style={{
           background: 'linear-gradient(135deg, #e8f4f8 0%, #f0e8f4 50%, #fef3e8 100%)'
         }}>
      <div className="content glass" style={{
        width: '420px',
        padding: '35px 40px',
        borderRadius: '16px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3">
            <i className="ri-train-fill text-4xl" style={{ color: '#1e40af' }}></i>
            <h1 className="text-3xl font-bold" style={{ color: '#1e293b' }}>Railway</h1>
          </div>
        </div>
        
        <div className="flex gap-2 mb-6">
          <button
            data-testid="login-tab-btn"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
              isLogin 
                ? 'bg-white text-blue-700 shadow-md' 
                : 'bg-transparent text-gray-600 hover:bg-white/50'
            }`}
          >
            Login
          </button>
          <button
            data-testid="register-tab-btn"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
              !isLogin 
                ? 'bg-white text-blue-700 shadow-md' 
                : 'bg-transparent text-gray-600 hover:bg-white/50'
            }`}
          >
            Register
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin} data-testid="login-form">
            <div className="input-box" style={{ position: 'relative', marginBottom: '24px' }}>
              <input
                data-testid="login-username-input"
                type="text"
                placeholder="Username"
                required
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                style={{
                  width: '100%',
                  height: '50px',
                  background: 'rgba(255, 255, 255, 0.5)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '25px',
                  padding: '0 45px 0 20px',
                  fontSize: '15px',
                  color: '#1e293b'
                }}
              />
              <i className="ri-user-fill" style={{
                position: 'absolute',
                top: '50%',
                right: '20px',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: '#64748b'
              }}></i>
            </div>

            <div className="input-box" style={{ position: 'relative', marginBottom: '20px' }}>
              <input
                data-testid="login-password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                required
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                style={{
                  width: '100%',
                  height: '50px',
                  background: 'rgba(255, 255, 255, 0.5)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '25px',
                  padding: '0 45px 0 20px',
                  fontSize: '15px',
                  color: '#1e293b'
                }}
              />
              <i 
                className={showPassword ? 'ri-eye-fill' : 'ri-eye-off-fill'}
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '20px',
                  transform: 'translateY(-50%)',
                  fontSize: '18px',
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              ></i>
            </div>

            <div className="flex items-center justify-between mb-5" style={{ fontSize: '14px' }}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" style={{ cursor: 'pointer' }} />
                <span style={{ color: '#475569' }}>Remember me</span>
              </label>
            </div>

            <button
              data-testid="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btnn"
              style={{
                width: '100%',
                height: '48px',
                background: '#1e40af',
                color: 'white',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-loader-4-line animate-spin"></i>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>

            <div className="text-center mt-6" style={{ fontSize: '14px', color: '#64748b' }}>
              <p>Default Admin: <strong>admin</strong> / <strong>admin123</strong></p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} data-testid="register-form">
            <div className="input-box" style={{ position: 'relative', marginBottom: '20px' }}>
              <input
                data-testid="register-username-input"
                type="text"
                placeholder="Username"
                required
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                style={{
                  width: '100%',
                  height: '50px',
                  background: 'rgba(255, 255, 255, 0.5)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '25px',
                  padding: '0 45px 0 20px',
                  fontSize: '15px',
                  color: '#1e293b'
                }}
              />
              <i className="ri-user-fill" style={{
                position: 'absolute',
                top: '50%',
                right: '20px',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: '#64748b'
              }}></i>
            </div>

            <div className="input-box" style={{ position: 'relative', marginBottom: '20px' }}>
              <input
                data-testid="register-fullname-input"
                type="text"
                placeholder="Full Name"
                required
                value={registerData.full_name}
                onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                style={{
                  width: '100%',
                  height: '50px',
                  background: 'rgba(255, 255, 255, 0.5)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '25px',
                  padding: '0 45px 0 20px',
                  fontSize: '15px',
                  color: '#1e293b'
                }}
              />
              <i className="ri-user-line" style={{
                position: 'absolute',
                top: '50%',
                right: '20px',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: '#64748b'
              }}></i>
            </div>

            <div className="input-box" style={{ position: 'relative', marginBottom: '20px' }}>
              <input
                data-testid="register-email-input"
                type="email"
                placeholder="Email (optional)"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                style={{
                  width: '100%',
                  height: '50px',
                  background: 'rgba(255, 255, 255, 0.5)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '25px',
                  padding: '0 45px 0 20px',
                  fontSize: '15px',
                  color: '#1e293b'
                }}
              />
              <i className="ri-mail-line" style={{
                position: 'absolute',
                top: '50%',
                right: '20px',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: '#64748b'
              }}></i>
            </div>

            <div className="input-box" style={{ position: 'relative', marginBottom: '20px' }}>
              <input
                data-testid="register-phone-input"
                type="tel"
                placeholder="Phone (optional)"
                value={registerData.phone}
                onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                style={{
                  width: '100%',
                  height: '50px',
                  background: 'rgba(255, 255, 255, 0.5)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '25px',
                  padding: '0 45px 0 20px',
                  fontSize: '15px',
                  color: '#1e293b'
                }}
              />
              <i className="ri-phone-line" style={{
                position: 'absolute',
                top: '50%',
                right: '20px',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: '#64748b'
              }}></i>
            </div>

            <div className="input-box" style={{ position: 'relative', marginBottom: '20px' }}>
              <input
                data-testid="register-password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                required
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                style={{
                  width: '100%',
                  height: '50px',
                  background: 'rgba(255, 255, 255, 0.5)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '25px',
                  padding: '0 45px 0 20px',
                  fontSize: '15px',
                  color: '#1e293b'
                }}
              />
              <i 
                className={showPassword ? 'ri-eye-fill' : 'ri-eye-off-fill'}
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '20px',
                  transform: 'translateY(-50%)',
                  fontSize: '18px',
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              ></i>
            </div>

            <div className="input-box" style={{ position: 'relative', marginBottom: '24px' }}>
              <input
                data-testid="register-confirm-password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                required
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                style={{
                  width: '100%',
                  height: '50px',
                  background: 'rgba(255, 255, 255, 0.5)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '25px',
                  padding: '0 45px 0 20px',
                  fontSize: '15px',
                  color: '#1e293b'
                }}
              />
              <i className="ri-lock-line" style={{
                position: 'absolute',
                top: '50%',
                right: '20px',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: '#64748b'
              }}></i>
            </div>

            <button
              data-testid="register-submit-btn"
              type="submit"
              disabled={loading}
              className="btnn"
              style={{
                width: '100%',
                height: '48px',
                background: '#1e40af',
                color: 'white',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-loader-4-line animate-spin"></i>
                  Registering...
                </span>
              ) : (
                'Register'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;

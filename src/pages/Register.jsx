import React, { useState } from 'react';
import { useNavigate, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', city: '', state: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const role = queryParams.get('role') || 'user';
  const isAdmin = role === 'admin';

  if (loading) return null;
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register({ ...formData, role });
      navigate(isAdmin ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-center animate-fade-in" style={{ minHeight: '100vh', padding: '2rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
        <div className="flex-center" style={{ flexDirection: 'column', marginBottom: '2rem' }}>
          <ShieldAlert color={isAdmin ? "var(--warning)" : "var(--primary)"} size={40} style={{ marginBottom: '1rem' }} />
          <h2 style={{ margin: 0 }}>{isAdmin ? 'City Official Registration' : 'Citizen Registration'}</h2>
          <p style={{ margin: 0 }}>Join CrisisSync to {isAdmin ? 'manage emergencies' : 'report emergencies'}</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Phone</label>
              <input type="tel" name="phone" className="form-input" value={formData.phone} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-input" value={formData.password} onChange={handleChange} required minLength="6" />
          </div>

          <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">City</label>
              <input type="text" name="city" className="form-input" value={formData.city} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">State</label>
              <input type="text" name="state" className="form-input" value={formData.state} onChange={handleChange} required />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : <><UserPlus size={18} /> Register</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          Already have an account? <Link to={`/login?role=${role}`} style={{ color: isAdmin ? 'var(--warning)' : 'var(--primary)', textDecoration: 'none' }}>Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

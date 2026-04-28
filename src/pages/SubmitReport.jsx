import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Send, MapPin, Loader } from 'lucide-react';

const SubmitReport = () => {
  const [formData, setFormData] = useState({
    title: '', category: 'other', severity: 'low', description: '', address: ''
  });
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [enums, setEnums] = useState({ categories: [], severities: [] });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const res = await api.get('/emergencies/meta/enums');
        setEnums(res.data);
        if (res.data.categories.length > 0) {
          setFormData(prev => ({ ...prev, category: res.data.categories[0] }));
        }
        if (res.data.severities.length > 0) {
          setFormData(prev => ({ ...prev, severity: res.data.severities[0] }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchEnums();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsGettingLocation(false);
      },
      () => {
        setError('Unable to retrieve your location');
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location.lat || !location.lng) {
      setError('Location is required. Please provide your location.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const payload = {
        ...formData,
        latitude: location.lat,
        longitude: location.lng
      };
      
      const res = await api.post('/emergencies', payload);
      navigate(`/report/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Submit Emergency Report</h2>
        <p>Please provide as much detail as possible to help responders.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel">
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Title / Brief Summary</label>
          <input type="text" name="title" className="form-input" value={formData.title} onChange={handleChange} required placeholder="e.g. Major collision on Highway 1" />
        </div>

        <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
              {enums.categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Severity</label>
            <select name="severity" className="form-select" value={formData.severity} onChange={handleChange}>
              {enums.severities.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea name="description" className="form-textarea" value={formData.description} onChange={handleChange} required placeholder="Describe what happened, injuries, hazards..." rows={5}></textarea>
        </div>

        <div className="form-group">
          <label className="form-label">Location Details</label>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Coordinates</span>
                {location.lat ? (
                  <span style={{ fontWeight: '500' }}>{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>
                ) : (
                  <span style={{ fontStyle: 'italic', color: 'var(--danger)' }}>Not set</span>
                )}
              </div>
              <button type="button" className="btn btn-secondary" onClick={getLocation} disabled={isGettingLocation}>
                {isGettingLocation ? <><Loader size={16} className="animate-spin" /> Locating...</> : <><MapPin size={16} /> Get My Location</>}
              </button>
            </div>
            
            <input type="text" name="address" className="form-input" value={formData.address} onChange={handleChange} placeholder="Address or Landmark (optional)" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button type="button" className="btn btn-secondary" style={{ marginRight: '1rem' }} onClick={() => navigate('/dashboard')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || !location.lat}>
            {isSubmitting ? 'Submitting...' : <><Send size={18} /> Submit Report</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitReport;

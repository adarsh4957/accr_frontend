import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Filter, MapPin, AlertTriangle } from 'lucide-react';

const AdminQueue = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchEmergencies = async () => {
      try {
        const res = await api.get('/emergencies');
        setEmergencies(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmergencies();
  }, []);

  useEffect(() => {
    if (filterStatus === 'all') {
      setFiltered(emergencies);
    } else {
      setFiltered(emergencies.filter(e => e.status === filterStatus));
    }
  }, [filterStatus, emergencies]);

  if (loading) return <div className="flex-center" style={{ height: '60vh' }}>Loading queue...</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h2>Emergency Queue</h2>
          <p>Triage and manage all reported emergencies in your city.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={20} color="var(--text-muted)" />
          <select 
            className="form-select" 
            style={{ width: 'auto', background: 'var(--bg-panel)' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.length === 0 ? (
          <div className="glass-panel flex-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>
            No emergencies found matching the filter.
          </div>
        ) : (
          filtered.map((report) => (
            <Link to={`/admin/report/${report._id}`} key={report._id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-panel hover-card flex-between" style={{ padding: '1.25rem', gap: '1rem', flexDirection: window.innerWidth < 768 ? 'column' : 'row', alignItems: window.innerWidth < 768 ? 'flex-start' : 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <span className={`badge badge-${report.status}`}>{report.status.replace('_', ' ')}</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{new Date(report.createdAt).toLocaleString()}</span>
                    {report.severity === 'critical' && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--danger)', fontSize: '0.875rem', fontWeight: 'bold' }}><AlertTriangle size={14} /> CRITICAL</span>}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{report.title}</h3>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> {report.address || 'Location provided'}</span>
                    <span style={{ textTransform: 'capitalize' }}>Category: {report.category}</span>
                  </div>
                </div>
                
                <div className="hidden md:block text-right">
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Reporter</div>
                  <div style={{ fontWeight: '500' }}>{report.user?.name || 'Unknown'}</div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminQueue;

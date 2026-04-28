import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Plus, MapPin, Clock } from 'lucide-react';

const Dashboard = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/emergencies/mine');
        setEmergencies(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="flex-center" style={{ height: '60vh' }}>Loading reports...</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h2>My Reports</h2>
          <p>Track the status of emergencies you have reported.</p>
        </div>
        <Link to="/report" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={20} /> New Report
        </Link>
      </div>

      {emergencies.length === 0 ? (
        <div className="glass-panel flex-center" style={{ flexDirection: 'column', padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <Plus size={40} color="var(--primary)" />
          </div>
          <h3>No reports yet</h3>
          <p>You haven't submitted any emergency reports. Click below to submit one.</p>
          <Link to="/report" className="btn btn-secondary" style={{ textDecoration: 'none', marginTop: '1rem' }}>
            Submit a Report
          </Link>
        </div>
      ) : (
        <div className="grid-2">
          {emergencies.map((report) => (
            <Link to={`/report/${report._id}`} key={report._id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-panel hover-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <span className={`badge badge-${report.status}`}>
                    {report.status.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', flex: 1 }}>{report.title}</h3>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={14} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                      {report.address || `${report.latitude?.toFixed(2)}, ${report.longitude?.toFixed(2)}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', textTransform: 'capitalize' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: report.severity === 'critical' ? 'var(--danger)' : report.severity === 'high' ? 'var(--warning)' : 'var(--primary)' }}></span>
                    {report.severity || 'Unknown'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', textTransform: 'capitalize' }}>
                    {report.category}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

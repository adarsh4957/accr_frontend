import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Users, Building } from 'lucide-react';

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return (
    <div className="flex-center animate-fade-in" style={{ minHeight: '100vh', padding: '2rem', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <ShieldAlert color="var(--primary)" size={64} style={{ marginBottom: '1rem', filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.5))' }} />
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800' }}>
          CrisisSync
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', lineHeight: '1.6' }}>
          Unified emergency reporting and response coordination platform. Please select your portal to continue.
        </p>
      </div>

      <div className="grid-2" style={{ gap: '2rem', width: '100%', maxWidth: '900px' }}>
        <div 
          className="glass-panel hover-card flex-center" 
          style={{ flexDirection: 'column', padding: '4rem 2rem', cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s ease', transform: 'translateY(0)' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onClick={() => navigate('/login?role=user')}
        >
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem', boxShadow: '0 0 30px rgba(59,130,246,0.2)' }}>
            <Users color="var(--primary)" size={48} />
          </div>
          <h2 style={{ marginBottom: '0.75rem', fontSize: '1.75rem' }}>Citizen Portal</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1.1rem', lineHeight: '1.5' }}>
            Report emergencies, track incident status, and communicate with dispatchers.
          </p>
        </div>

        <div 
          className="glass-panel hover-card flex-center" 
          style={{ flexDirection: 'column', padding: '4rem 2rem', cursor: 'pointer', textAlign: 'center', borderTop: '4px solid var(--warning)', transition: 'all 0.3s ease', transform: 'translateY(0)' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onClick={() => navigate('/login?role=admin')}
        >
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem', boxShadow: '0 0 30px rgba(245,158,11,0.2)' }}>
            <Building color="var(--warning)" size={48} />
          </div>
          <h2 style={{ marginBottom: '0.75rem', fontSize: '1.75rem' }}>City Official</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1.1rem', lineHeight: '1.5' }}>
            Manage emergency queues, triage reports, and coordinate response teams.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;

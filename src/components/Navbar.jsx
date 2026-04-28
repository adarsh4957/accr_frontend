import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { ShieldAlert, Bell, LogOut, User as UserIcon, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useSocket();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotifClick = (n) => {
    if (!n.is_read) markAsRead(n._id);
    setShowNotifs(false);
    if (user?.role === 'admin') {
      navigate(`/admin/report/${n.emergency_id}`);
    } else {
      navigate(`/report/${n.emergency_id}`);
    }
  };

  if (!user) return null;

  return (
    <nav className="glass-nav">
      <div className="container flex-between" style={{ padding: '1rem 1.5rem' }}>
        <Link to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="flex-center" style={{ gap: '0.5rem', textDecoration: 'none', color: 'white' }}>
          <ShieldAlert color="#3b82f6" size={28} />
          <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '1px' }}>CrisisSync</span>
        </Link>

        {/* Desktop Menu */}
        <div className="flex-center" style={{ gap: '1.5rem' }}>
          <div className="hidden md:flex flex-center" style={{ gap: '1.5rem' }}>
            {user.role === 'admin' ? (
              <>
                <Link to="/admin/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
                <Link to="/admin/queue" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Queue</Link>
                <Link to="/admin/users" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Roster</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>My Reports</Link>
                <Link to="/report" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Submit Report</Link>
              </>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifs(!showNotifs)}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', position: 'relative' }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger)', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifs && (
              <div className="glass-panel" style={{ position: 'absolute', top: '40px', right: '-10px', width: '320px', padding: '1rem', zIndex: 100 }}>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0 }}>Notifications</h4>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {notifications.length === 0 ? (
                    <p style={{ textAlign: 'center', margin: 0, fontSize: '0.875rem' }}>No notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n._id} 
                        onClick={() => handleNotifClick(n)}
                        style={{ padding: '0.75rem', background: n.is_read ? 'rgba(255,255,255,0.05)' : 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', cursor: 'pointer', borderLeft: n.is_read ? 'none' : '3px solid var(--primary)' }}
                      >
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'white' }}>{n.message}</p>
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(n.createdAt).toLocaleTimeString()}</small>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex-center" style={{ gap: '0.5rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <LogOut size={16} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

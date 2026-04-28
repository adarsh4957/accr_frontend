import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Users, Shield, User as UserIcon } from 'lucide-react';

const CityRoster = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error(err);
      alert('Failed to update user role');
    }
  };

  if (loading) return <div className="flex-center" style={{ height: '60vh' }}>Loading roster...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2>City Roster</h2>
        <p>Manage users and administrators in your jurisdiction.</p>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem', fontWeight: '500', color: 'var(--text-muted)' }}>Name</th>
              <th style={{ padding: '1rem', fontWeight: '500', color: 'var(--text-muted)' }}>Email & Phone</th>
              <th style={{ padding: '1rem', fontWeight: '500', color: 'var(--text-muted)' }}>Location</th>
              <th style={{ padding: '1rem', fontWeight: '500', color: 'var(--text-muted)' }}>Role</th>
              <th style={{ padding: '1rem', fontWeight: '500', color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: user.role === 'admin' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {user.role === 'admin' ? <Shield size={16} /> : <UserIcon size={16} />}
                      </div>
                      <span style={{ fontWeight: '500' }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div>{user.email}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user.phone}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div>{user.city}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user.state}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge" style={{ background: user.role === 'admin' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.1)', color: user.role === 'admin' ? 'var(--primary)' : 'var(--text-main)', border: `1px solid ${user.role === 'admin' ? 'rgba(59, 130, 246, 0.3)' : 'var(--border-color)'}` }}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button 
                      onClick={() => handleRoleToggle(user._id, user.role)}
                      className="btn btn-secondary" 
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                      {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CityRoster;

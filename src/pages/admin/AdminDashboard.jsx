import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, CheckCircle, Clock, AlertOctagon } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#0ea5e9', '#64748b'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        const data = res.data;
        const total = data.by_status.reduce((acc, curr) => acc + curr.count, 0);
        setStats({
          byCategory: data.by_category.map(c => ({ _id: c.category, count: c.count })),
          byStatus: data.by_status.map(s => ({ _id: s.status, count: s.count })),
          avgResolutionTimeHours: (data.averages.time_to_resolve_seconds || 0) / 3600,
          total: total
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex-center" style={{ height: '60vh' }}>Loading dashboard...</div>;
  if (!stats) return <div className="flex-center" style={{ height: '60vh' }}>Failed to load stats</div>;

  const categoryData = stats.byCategory.map(c => ({ name: c._id, value: c.count }));
  const statusData = stats.byStatus.map(s => ({ name: s._id, value: s.count }));

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2>City Overview</h2>
        <p>Real-time emergency statistics for your jurisdiction.</p>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '12px' }}><Activity color="var(--primary)" size={24} /></div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.total}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Emergencies</div>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '12px' }}><Clock color="var(--warning)" size={24} /></div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.byStatus.find(s => s._id === 'pending')?.count || 0}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Pending Action</div>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '12px' }}><CheckCircle color="var(--success)" size={24} /></div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.byStatus.find(s => s._id === 'resolved')?.count || 0}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Resolved Cases</div>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px' }}><AlertOctagon color="var(--danger)" size={24} /></div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {Math.round(stats.avgResolutionTimeHours)}h
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Avg Resolution Time</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '2rem' }}>
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Emergencies by Category</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({name, value}) => `${name}: ${value}`}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Status Distribution</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white' }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

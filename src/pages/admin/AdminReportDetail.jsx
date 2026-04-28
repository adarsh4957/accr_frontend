import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Clock, MapPin, AlertTriangle, ArrowLeft, ShieldAlert, EyeOff } from 'lucide-react';

const AdminReportDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Triage state
  const [triageStatus, setTriageStatus] = useState('');
  const [triageSeverity, setTriageSeverity] = useState('');
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportRes, timelineRes, commentsRes] = await Promise.all([
          api.get(`/emergencies/${id}`),
          api.get(`/emergencies/${id}/timeline`),
          api.get(`/emergencies/${id}/comments`)
        ]);
        setReport(reportRes.data);
        setTimeline(timelineRes.data);
        setComments(commentsRes.data);
        setTriageStatus(reportRes.data.status);
        setTriageSeverity(reportRes.data.severity);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/emergencies/${id}/comments`, { content: newComment, is_internal: isInternal });
      setComments([...comments, res.data]);
      setNewComment('');
      setIsInternal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async () => {
    if (triageStatus === 'dismissed' && !adminNote) {
      alert('Please provide a reason for dismissal in the note field.');
      return;
    }

    try {
      if (triageStatus === 'dismissed') {
        await api.post(`/emergencies/${id}/dismiss`, { reason: adminNote });
      } else {
        await api.patch(`/emergencies/${id}/status`, { status: triageStatus, admin_note: adminNote });
      }
      
      if (triageSeverity !== report.severity) {
        await api.patch(`/emergencies/${id}/severity`, { severity: triageSeverity });
      }

      // Reload
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to update report');
    }
  };

  if (loading) return <div className="flex-center" style={{ height: '60vh' }}>Loading details...</div>;
  if (!report) return <div className="flex-center" style={{ height: '60vh' }}>Report not found</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '2rem', padding: '0.5rem 1rem' }}>
        <ArrowLeft size={16} /> Back to Queue
      </button>

      <div className="grid-2" style={{ gap: '2rem' }}>
        {/* Left Column: Details & Triage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Triage Panel */}
          <div className="glass-panel" style={{ border: '1px solid var(--primary)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
              <ShieldAlert size={20} /> Admin Triage Control
            </h3>
            
            <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Update Status</label>
                <select className="form-select" value={triageStatus} onChange={(e) => setTriageStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Update Severity</label>
                <select className="form-select" value={triageSeverity} onChange={(e) => setTriageSeverity(e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Note (Required for Dismissal)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Reason for change..." 
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleUpdateStatus}>
              Apply Changes
            </button>
          </div>

          <div className="glass-panel">
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <span className={`badge badge-${report.status}`}>{report.status.replace('_', ' ')}</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Reported by: {report.user?.name} ({report.user?.email})
              </span>
            </div>
            <h2 style={{ marginBottom: '1.5rem' }}>{report.title}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <MapPin size={20} color="var(--primary)" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: '500' }}>Location</div>
                  <div style={{ color: 'var(--text-muted)' }}>{report.address || 'Address not provided'}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Lat: {report.latitude?.toFixed(4)}, Lng: {report.longitude?.toFixed(4)}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <AlertTriangle size={20} color={report.severity === 'critical' ? 'var(--danger)' : 'var(--warning)'} style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: '500' }}>Category & Severity</div>
                  <div style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {report.category} - {report.severity}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Description</div>
              <p style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', margin: 0, whiteSpace: 'pre-wrap' }}>
                {report.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Comments & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <MessageSquare size={20} /> Dispatch Comm & Updates
            </h3>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem', marginBottom: '1rem' }}>
              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>No comments yet.</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} style={{ background: comment.is_internal ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', borderLeft: comment.is_internal ? '3px solid var(--warning)' : (comment.user?.role === 'admin' ? '3px solid var(--primary)' : 'none') }}>
                    <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '500', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {comment.user?.name || 'Unknown'} 
                        {comment.user?.role === 'admin' && <span className="badge" style={{ background: 'var(--primary)', color: 'white', fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>ADMIN</span>}
                        {comment.is_internal && <span className="badge" style={{ background: 'var(--warning)', color: 'black', fontSize: '0.6rem', padding: '0.1rem 0.4rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><EyeOff size={10} /> INTERNAL</span>}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handlePostComment} style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', color: isInternal ? 'var(--warning)' : 'var(--text-main)' }}>
                  <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
                  <EyeOff size={14} /> Make comment internal (hidden from user)
                </label>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Write a message..." 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{ flex: 1, borderColor: isInternal ? 'var(--warning)' : 'var(--border-color)' }}
                />
                <button type="submit" className="btn btn-primary" disabled={!newComment.trim()}>Send</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportDetail;

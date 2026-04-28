import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Clock, MapPin, AlertTriangle, ArrowLeft } from 'lucide-react';

const ReportDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

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
      const res = await api.post(`/emergencies/${id}/comments`, { content: newComment, is_internal: false });
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex-center" style={{ height: '60vh' }}>Loading details...</div>;
  if (!report) return <div className="flex-center" style={{ height: '60vh' }}>Report not found</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '2rem', padding: '0.5rem 1rem' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid-2" style={{ gap: '2rem' }}>
        {/* Left Column: Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel">
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <span className={`badge badge-${report.status}`}>{report.status.replace('_', ' ')}</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {new Date(report.createdAt).toLocaleString()}
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

          {/* Timeline */}
          <div className="glass-panel">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Clock size={20} /> Status History
            </h3>
            <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-color)' }}>
              {timeline.map((event, idx) => (
                <div key={idx} style={{ position: 'relative', marginBottom: idx === timeline.length - 1 ? 0 : '1.5rem' }}>
                  <div style={{ position: 'absolute', left: '-1.5rem', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', transform: 'translate(-5px, 4px)', border: '2px solid var(--bg-panel)' }}></div>
                  <div style={{ fontWeight: '500', textTransform: 'capitalize' }}>Changed to {event.to_status?.replace('_', ' ') || event.event_type}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    {new Date(event.occurred_at).toLocaleString()}
                  </div>
                  {event.note && (
                    <div style={{ fontSize: '0.875rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                      <strong>Note:</strong> {event.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Comments */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 150px)', position: 'sticky', top: '100px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <MessageSquare size={20} /> Updates & Discussion
          </h3>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem', marginBottom: '1rem' }}>
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>No comments yet.</div>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} style={{ background: comment.user?._id === user._id ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', borderLeft: comment.user?.role === 'admin' ? '3px solid var(--warning)' : 'none' }}>
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '500', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {comment.user?.name || 'Unknown'} 
                      {comment.user?.role === 'admin' && <span className="badge" style={{ background: 'var(--warning)', color: 'black', fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>ADMIN</span>}
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
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Write a message..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" disabled={!newComment.trim()}>Send</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;

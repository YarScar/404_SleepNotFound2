// HomePage.jsx
import React, { useState, useEffect } from 'react';
import DashboardCard from '../components/DashboardCard'; 
import CloudDecoration from '../components/CloudDecoration';
import '../Styles/Pages.css';
// Using Public folder version to avoid build issues with spaces in filename
const najahLogo = '/najah-logo.png';
    
export default function HomePage() {
  const sampleTasks = [
    { id: 1, subject: 'Mathematics', description: 'Complete calculus hw', color: '#FFF4B8', done: false, dueDate: null, priority: 'Medium', subtasks: [] },
    { id: 2, subject: 'EL4', description: 'Write 5 paragraphs to essay', color: '#FFD4D4', done: false, dueDate: null, priority: 'High', subtasks: [] },
    { id: 3, subject: 'Art', description: 'Work on painting for 1 hour', color: '#E4C4F4', done: true, dueDate: null, priority: 'Low', subtasks: [ { id: 1, text: 'Gather brushes', done: true }, { id: 2, text: 'Sketch idea', done: false } ] }
  ];

  const [recentTasks, setRecentTasks] = useState(() => {
    try {
      const raw = localStorage.getItem('tasks_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        // normalize shape: description, done, dueDate, priority, subtasks
        return parsed.map((t, i) => ({
          id: t.id ?? Date.now() + i,
          subject: t.subject ?? t.title ?? 'Untitled',
          description: t.description ?? t.task ?? '',
          color: t.color ?? '#FFF',
          done: !!t.done,
          dueDate: t.dueDate ?? null,
          priority: t.priority ?? 'Medium',
          subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
        }));
      }
      return sampleTasks;
    } catch {
      return sampleTasks;
    }
  });

  const [filter, setFilter] = useState('All');

  useEffect(() => {
    try {
      localStorage.setItem('tasks_v1', JSON.stringify(recentTasks));
    } catch {}
  }, [recentTasks]);

  function toggleCompleted(id) {
    setRecentTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  // No inline editing on homepage — updates are handled in TasksPage

  const todayISO = new Date().toISOString().slice(0,10);

  function matchesFilter(t) {
    if (filter === 'All') return true;
    if (filter === 'Today') return t.dueDate === todayISO;
    return (t.priority || 'Medium') === filter;
  }

  return ( 
    <>
      <div className="home-page"> 
        <CloudDecoration />
        
        {/* Hero Section */}
        <div className="hero-section">
        <div className="profile-icon">
          <img src={najahLogo} alt="Najah Logo" className="logo-image" />
        </div>
        <h1 className="app-title">Najah</h1>
        <p className="tagline">Your peaceful companion for productive studying</p>
        <div className="points-badge">
          <span className="points-icon">✓</span>
          <span>248 points</span>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="dashboard-grid">
        <DashboardCard title="Total tasks" value={recentTasks.length} color="#F97316" />
        <DashboardCard title="Completed" value={recentTasks.filter(t => t.done).length} color="#10B981" />
        <DashboardCard title="Subjects" value={5} color="#3B82F6" />
      </div>

      {/* Filter / Priority Tabs */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 18 }}>
        {['All','Today','High','Medium','Low'].map(p => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`control-button ${filter === p ? 'pause-play-button' : ''}`}
            style={{ padding: '6px 12px', borderRadius: 20 }}
            aria-pressed={filter === p}
          >{p}</button>
        ))}
      </div>

      {/* Recent Tasks Section */}
      <div className="recent-tasks">
        <h2 className="recent-tasks-title">Recent Tasks</h2>
        <div className="tasks-list">
          {recentTasks.filter(matchesFilter).map(task => (
            <div 
              key={task.id} 
              className={`task-item ${task.done ? 'completed' : ''}`}
              style={{ backgroundColor: task.color || '#fff' }}
            >
              <div className="task-checkbox">
                <div
                  className={`checkbox ${task.done ? 'checked' : ''}`}
                  onClick={() => toggleCompleted(task.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleCompleted(task.id); }}
                  aria-pressed={task.done}
                  title={task.done ? 'Mark as undone' : 'Mark as done'}
                >
                  {task.done && <span>✓</span>}
                </div>
              </div>

              <div className="task-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <p className={`task-subject ${task.done ? 'strikethrough' : ''}`} style={{ margin: 0 }}>{task.subject}</p>
                  <span style={{ fontSize: 12, padding: '6px 8px', borderRadius: 12, border: '2px solid #333' }}>{task.priority || 'Medium'}</span>
                </div>

                {task.description ? (
                  <p className={`task-description ${task.done ? 'strikethrough' : ''}`} style={{ margin: '6px 0 0' }}>{task.description}</p>
                ) : null}
              </div>
            </div>
          ))}
          {recentTasks.filter(matchesFilter).length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>No tasks for this filter.</p>}
        </div>
      </div>
    </div>
      
    {/* Floating Bubbles */}
    <div className="bubble"></div>
    <div className="bubble"></div>
    <div className="bubble"></div>
    <div className="bubble"></div>
    <div className="bubble"></div>
    <div className="bubble"></div>
    <div className="bubble"></div>
    <div className="bubble"></div>
    <div className="bubble"></div>
    <div className="bubble"></div>
    <div className="bubble"></div>
    <div className="bubble"></div>
    <div className="bubble"></div>
    <div className="bubble"></div>
    <div className="bubble"></div>
    </>
  );
}

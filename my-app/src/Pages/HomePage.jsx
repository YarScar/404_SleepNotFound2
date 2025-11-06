// HomePage.jsx
import React, { useState, useEffect } from 'react';
import DashboardCard from '../components/DashboardCard'; 
import CloudDecoration from '../components/CloudDecoration';
import '../Styles/Pages.css';
import najahLogo from '../assets/najah logo.png';
    
export default function HomePage() {
  const sampleTasks = [
    { id: 1, subject: 'Mathematics', task: 'Complete calculus hw', color: '#FFF4B8', completed: false },
    { id: 2, subject: 'EL4', task: 'Write 5 paragraphs to essay', color: '#FFD4D4', completed: false },
    { id: 3, subject: 'Art', task: 'Work on painting for 1 hour', color: '#E4C4F4', completed: true }
  ];

  const [recentTasks, setRecentTasks] = useState(() => {
    try {
      const raw = localStorage.getItem('recent_tasks_v1');
      return raw ? JSON.parse(raw) : sampleTasks;
    } catch {
      return sampleTasks;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('recent_tasks_v1', JSON.stringify(recentTasks));
    } catch {}
  }, [recentTasks]);

  function toggleCompleted(id) {
    setRecentTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }

  return ( 
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
        <DashboardCard title="Completed" value={recentTasks.filter(t => t.completed).length} color="#10B981" />
        <DashboardCard title="Subjects" value={5} color="#3B82F6" />
      </div>

      {/* Recent Tasks Section */}
      <div className="recent-tasks">
        <h2 className="recent-tasks-title">Recent Tasks</h2>
        <div className="tasks-list">
          {recentTasks.map(task => (
            <div 
              key={task.id} 
              className={`task-item ${task.completed ? 'completed' : ''}`}
              style={{ backgroundColor: task.color }}
            >
              <div className="task-checkbox">
                <div
                  className={`checkbox ${task.completed ? 'checked' : ''}`}
                  onClick={() => toggleCompleted(task.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleCompleted(task.id); }}
                  aria-pressed={task.completed}
                  title={task.completed ? 'Mark as undone' : 'Mark as done'}
                >
                  {task.completed && <span>✓</span>}
                </div>
              </div>
              <div className="task-content">
                <h3 className="task-subject">{task.subject}</h3>
                <p className={`task-description ${task.completed ? 'strikethrough' : ''}`}>
                  {task.task}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// HomePage.jsx
import DashboardCard from '../components/DashboardCard'; 
import CloudDecoration from '../components/CloudDecoration';
import '../Styles/Pages.css';
import najahLogo from '../assets/najah logo.png';
    
export default function HomePage() {
  // Sample recent tasks data
  const recentTasks = [
    { id: 1, subject: 'Mathematics', task: 'Complete calculus hw', color: '#FFF4B8', completed: false },
    { id: 2, subject: 'EL4', task: 'Write 5 paragraphs to essay', color: '#FFD4D4', completed: false },
    { id: 3, subject: 'Art', task: 'Work on painting for 1 hour', color: '#E4C4F4', completed: true }
  ];

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
        <DashboardCard title="Total tasks" value={3} color="#F97316" />
        <DashboardCard title="Completed" value={0} color="#10B981" />
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
                <div className={`checkbox ${task.completed ? 'checked' : ''}`}>
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

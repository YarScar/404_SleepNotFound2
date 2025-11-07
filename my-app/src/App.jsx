// Main App component - sets up routing and global components
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import TimerPage from './Pages/TimerPage';
import TasksPage from './Pages/TasksPage';
import ProfilePage from './Pages/ProfilePage';
import HomeworkHelpPage from './Pages/HomeworkHelpPage';
import Navigation from './components/Navigation';
import VolumeControl from './components/VolumeControl';

export default function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Define all routes for the app */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/timer" element={<TimerPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/homework-help" element={<HomeworkHelpPage />} />
          {/* Catch-all route for SPA - redirect to home if route not found */}
          <Route path="*" element={<HomePage />} />
        </Routes>
        {/* Global components available on all pages */}
        <VolumeControl />
        <Navigation />
      </div>
    </Router>
  );
}

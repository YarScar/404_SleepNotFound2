import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import TimerPage from './Pages/TimerPage';
import TasksPage from './Pages/TasksPage';
import ProfilePage from './Pages/ProfilePage';
import Navigation from './components/Navigation';

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/timer" element={<TimerPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
        <Navigation />
      </div>
    </Router>
  );
}

// Navigation component - bottom navigation bar with icons
import { Home, Clock, BookOpen, User, MessageCircleQuestion } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import '../Styles/Pages.css'

export default function Navigation() {
  // Get current route to highlight active link
  const location = useLocation();
  return (
    <div className="navigation">
      {/* Navigation links with active state highlighting */}
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}><Home /></Link>
      <Link to="/timer" className={location.pathname === '/timer' ? 'active' : ''}><Clock /></Link>
      <Link to="/tasks" className={location.pathname === '/tasks' ? 'active' : ''}><BookOpen /></Link>
      <Link to="/homework-help" className={location.pathname === '/homework-help' ? 'active' : ''}><MessageCircleQuestion /></Link>
      <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}><User /></Link>
    </div>
  );
}
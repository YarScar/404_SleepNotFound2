import { Home, Clock, BookOpen, User, MessageCircleQuestion } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import '../Styles/Pages.css'

export default function Navigation() {
  const location = useLocation();
  return (
    <div className="navigation">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}><Home /></Link>
      <Link to="/timer" className={location.pathname === '/timer' ? 'active' : ''}><Clock /></Link>
      <Link to="/tasks" className={location.pathname === '/tasks' ? 'active' : ''}><BookOpen /></Link>
      <Link to="/homework-help" className={location.pathname === '/homework-help' ? 'active' : ''}><MessageCircleQuestion /></Link>
      <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}><User /></Link>
    </div>
  );
}
// HomePage.jsx
import React from 'react';
import DashboardCard from '../components/DashboardCard';
import CloudDecoration from '../components/CloudDecoration';
import '../Styles/Pages.css';

export default function HomePage() {
  return (
    <div className="home-page">
      <CloudDecoration />
      <h1>Study Buddy</h1>
      <div className="dashboard-grid">
        <DashboardCard title="Total Tasks" value={10} />
        <DashboardCard title="Completed" value={5} />
        <DashboardCard title="Subjects" value={3} />
      </div>
    </div>
  );
}

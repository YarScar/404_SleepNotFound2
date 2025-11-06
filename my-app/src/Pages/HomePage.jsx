// HomePage.jsx
//This is a custom component, a reusable card UI showing data like tasks or stats.
import DashboardCard from '../components/DashboardCard'; 

import CloudDecoration from '../components/CloudDecoration';
// import '../Styles/Pages.css';
    
//functional component HomePage, export default so it can be imported easily anywhere else.
export default function HomePage() {
  return ( 
    //<div className="home-page" is the main wrapper for the homepage content. The class name can be styled in CSS.
    <div className="home-page"> 
      <CloudDecoration />
      <h1>Study Buddy</h1>
      <div className="dashboard-grid">
        <DashboardCard title="Total Tasks" value={10} />
        {<DashboardCard title="Completed" value={5} /> }
        {<DashboardCard title="Subjects" value={3} />}
      </div>
    </div>
  );
}

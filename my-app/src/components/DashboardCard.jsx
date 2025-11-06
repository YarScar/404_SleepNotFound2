import "../Styles/Pages.css";

export default function DashboardCard({ title, value, color = "#333" }) {
  return (
    <div className="dashboard-card">
      <h2 className="card-value" style={{ color }}>{value}</h2>
      <p className="card-title">{title}</p>
    </div>
  );
}


// import "../Styles/Pages.css";

// export default function DashboardCard({ onLogout }) {
//   return (
//     <div className="dashboard">
//       <h1>Hello, User 👋</h1>
//       <p>You’re logged in. Ready to study?</p>
//       <button onClick={onLogout}>Log Out</button>
//     </div>
//   );
// }

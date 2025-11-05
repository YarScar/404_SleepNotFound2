export default function LoginCard({ onLogin }) {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to StudyBuddy!</h1>
      <p>Your personal study companion.</p>
      <button onClick={onLogin}>Log In</button>
    </div>
  );
}

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/store/authStore';
import './DashboardPage.css';

export function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Para Servir Dashboard</h1>
        <div className="header-actions">
          <span className="user-info">
            {user.role} - {user.userId}
          </span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      <main className="dashboard-main">
        <div className="welcome-card">
          <h2>Welcome to Para Servir!</h2>
          <p>You are logged in as: {user.role}</p>
          <p>User ID: {user.userId}</p>
        </div>
      </main>
    </div>
  );
}


import { useState } from 'react';
import { Link } from 'react-router-dom';
import forgotPasswordImage from '../../assets/login_recuperate_password.png';
import logo from '../../assets/logo_servir.png';
import './AuthPages.css';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Implementar llamada al backend
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-form-section">
          <div className="auth-form-card">
            <div className="auth-logo-mobile">
              <img src={logo} alt="Para Servir" className="logo-img" />
            </div>
            <Link to="/login" className="back-link">
              ← Back to login
            </Link>
            <h1 className="auth-title">Forgot your password?</h1>
            <p className="auth-subtitle">
              Don't worry, happens to all of us. Enter your email below to recover your password
            </p>

            {submitted ? (
              <div className="success-message">
                <p>We've sent a password recovery link to your email.</p>
                <Link to="/login" className="auth-link">
                  Back to login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@gmail.com"
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="auth-button"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Submit'}
                </button>

                <div className="auth-divider">
                  <span>Or login with</span>
                </div>

                <Link to="/login" className="back-link">
                  ← Back to login
                </Link>
              </form>
            )}
          </div>
        </div>

        <div className="auth-image-section">
          <img src={forgotPasswordImage} alt="Forgot password illustration" className="auth-image" />
        </div>
      </div>
    </div>
  );
}


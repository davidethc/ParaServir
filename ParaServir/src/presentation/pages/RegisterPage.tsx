import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/store/authStore';
import { RegisterUserDTO } from '../../application/dto/RegisterUserDTO';
import loginImage from '../../assets/login_register.png';
import logo from '../../assets/logo_servir.png';
import './AuthPages.css';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    cedula: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: '',
    isWorker: false,
    categories: [] as string[],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const { register, loading, error, clearError, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (!agreeToTerms) {
      return;
    }

    const dto = new RegisterUserDTO({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      cedula: formData.cedula,
      phone: formData.phone,
      location: formData.location,
      isWorker: formData.isWorker,
      categories: formData.categories,
    });

    const result = await register(dto);

    if (result) {
      // Si es trabajador, redirigir a completar perfil
      if (formData.isWorker) {
        navigate('/complete-worker-profile');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-form-section">
          <div className="auth-form-card">
            <div className="auth-logo-mobile">
              <img src={logo} alt="Para Servir" className="logo-img" />
            </div>
            <h1 className="auth-title">Sign up</h1>
            <p className="auth-subtitle">
              Let's get you all set up so you can access your personal account.
            </p>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@gmail.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cedula">Cédula</label>
                <input
                  type="text"
                  id="cedula"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  placeholder="1234567890"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="1234567890"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="isWorker">Rol</label>
                <select
                  id="isWorker"
                  name="isWorker"
                  value={formData.isWorker ? 'trabajador' : 'usuario'}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      isWorker: e.target.value === 'trabajador',
                    }));
                  }}
                  disabled={loading}
                  className="form-select"
                >
                  <option value="usuario">Usuario</option>
                  <option value="trabajador">Trabajador</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <span className="error-text">Passwords do not match</span>
                )}
              </div>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  disabled={loading}
                />
                <span>
                  I agree to all the{' '}
                  <a href="#" className="terms-link">Terms</a> and{' '}
                  <a href="#" className="terms-link">Privacy Policies</a>
                </span>
              </label>

              <button
                type="submit"
                className="auth-button"
                disabled={loading || !agreeToTerms || formData.password !== formData.confirmPassword}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>

              <div className="auth-divider">
                <span>Or Sign up with</span>
              </div>

              <p className="auth-switch">
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>

        <div className="auth-image-section">
          <img src={loginImage} alt="Register illustration" className="auth-image" />
        </div>
      </div>
    </div>
  );
}


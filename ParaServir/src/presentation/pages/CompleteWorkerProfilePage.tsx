import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/store/authStore';
import { HttpServiceCategoryRepository } from '../../infrastructure/http/repositories/HttpServiceCategoryRepository';
import { HttpWorkerServiceRepository } from '../../infrastructure/http/repositories/HttpWorkerServiceRepository';
import type { ServiceCategory } from '../../domain/entities/ServiceCategory';
import loginImage from '../../assets/login_register.png';
import logo from '../../assets/logo_servir.png';
import './AuthPages.css';
import './CompleteWorkerProfilePage.css';

interface ServiceForm {
  categoryId: string;
  title: string;
  description: string;
}

export function CompleteWorkerProfilePage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<ServiceForm[]>([
    { categoryId: '', title: '', description: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated() || user.role !== 'trabajador') {
      navigate('/dashboard');
      return;
    }

    loadCategories();
  }, [isAuthenticated, user.role, navigate]);

  const loadCategories = async () => {
    try {
      const categoryRepo = new HttpServiceCategoryRepository();
      const cats = await categoryRepo.findAll();
      setCategories(cats);
    } catch (err) {
      setError('Error al cargar categorías');
      console.error(err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const addService = () => {
    if (services.length < 3) {
      setServices([...services, { categoryId: '', title: '', description: '' }]);
    }
  };

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  const updateService = (index: number, field: keyof ServiceForm, value: string) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (services.length < 1 || services.length > 3) {
      setError('Debes agregar entre 1 y 3 servicios');
      return;
    }

    for (const service of services) {
      if (!service.categoryId || !service.title || !service.description) {
        setError('Todos los campos son obligatorios');
        return;
      }
    }

    setLoading(true);

    try {
      const workerServiceRepo = new HttpWorkerServiceRepository();
      const userId = user.userId;

      if (!userId) {
        throw new Error('Usuario no encontrado');
      }

      // Crear cada servicio
      for (const service of services) {
        await workerServiceRepo.create({
          worker_id: userId,
          category_id: service.categoryId,
          title: service.title,
          description: service.description,
          base_price: null,
          is_available: true,
        });
      }

      // Redirigir al dashboard
      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al completar perfil';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategories) {
    return (
      <div className="auth-container">
        <div className="loading-message">Cargando categorías...</div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-form-section">
          <div className="auth-form-card">
            <div className="auth-logo-mobile">
              <img src={logo} alt="Para Servir" className="logo-img" />
            </div>
            <h1 className="auth-title">Completa tu perfil</h1>
            <p className="auth-subtitle">
              Agrega tus servicios como trabajador. Puedes agregar entre 1 y 3 servicios.
            </p>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {services.map((service, index) => (
                <div key={index} className="service-form-card">
                  <div className="service-form-header">
                    <h3>Servicio {index + 1}</h3>
                    {services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="remove-service-btn"
                        disabled={loading}
                      >
                        ✕ Eliminar
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor={`category-${index}`}>Categoría *</label>
                    <select
                      id={`category-${index}`}
                      value={service.categoryId}
                      onChange={(e) => updateService(index, 'categoryId', e.target.value)}
                      required
                      disabled={loading}
                      className="form-select"
                    >
                      <option value="">Selecciona una categoría</option>
                      {categories.map((cat) => (
                        <option key={cat.id.getValue()} value={cat.id.getValue()}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor={`title-${index}`}>Título *</label>
                    <input
                      type="text"
                      id={`title-${index}`}
                      value={service.title}
                      onChange={(e) => updateService(index, 'title', e.target.value)}
                      placeholder="Ej: Plomería profesional"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor={`description-${index}`}>Descripción *</label>
                    <textarea
                      id={`description-${index}`}
                      value={service.description}
                      onChange={(e) => updateService(index, 'description', e.target.value)}
                      placeholder="Describe tu servicio..."
                      rows={4}
                      required
                      disabled={loading}
                      className="form-textarea"
                    />
                  </div>
                </div>
              ))}

              {services.length < 3 && (
                <button
                  type="button"
                  onClick={addService}
                  className="add-service-btn"
                  disabled={loading}
                >
                  + Agregar otro servicio
                </button>
              )}

              <button
                type="submit"
                className="auth-button"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Completar perfil'}
              </button>
            </form>
          </div>
        </div>

        <div className="auth-image-section">
          <img src={loginImage} alt="Complete profile illustration" className="auth-image" />
        </div>
      </div>
    </div>
  );
}






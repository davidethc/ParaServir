BEGIN;

-- Extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


/* ===========================================================
   USERS (Login, roles)
   =========================================================== */
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('usuario', 'trabajador', 'admin')),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


/* ===========================================================
   PROFILES (Datos personales)
   =========================================================== */
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    cedula VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    location TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


/* ===========================================================
   SERVICE CATEGORIES (Carpintería, Plomería, etc)
   =========================================================== */
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50)
);


/* ===========================================================
   WORKER PROFILES (Datos profesionales de un trabajador)
   =========================================================== */
CREATE TABLE worker_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    years_experience INT DEFAULT 0,
    certification_url TEXT,
    verification_status VARCHAR(20) DEFAULT 'pending',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


/* ===========================================================
   WORKER SERVICES (Servicios ofrecidos por el trabajador)
   =========================================================== */
CREATE TABLE worker_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL,
    category_id UUID NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    base_price NUMERIC(10,2),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES service_categories(id)
);

CREATE INDEX idx_worker_services_category
    ON worker_services(category_id);

CREATE INDEX idx_worker_services_worker
    ON worker_services(worker_id);


/* ===========================================================
   SERVICE REQUESTS (Contrato entre cliente y trabajador)
   =========================================================== */
CREATE TABLE service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    worker_id UUID,
    service_id UUID,
    category_id UUID NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    address TEXT,
    scheduled_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES worker_services(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES service_categories(id)
);

CREATE INDEX idx_requests_client
    ON service_requests(client_id);

CREATE INDEX idx_requests_worker
    ON service_requests(worker_id);


/* ===========================================================
   MESSAGES (Chat entre cliente y trabajador)
   =========================================================== */
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);


/* ===========================================================
   REVIEWS (Opiniones después del servicio)
   =========================================================== */
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL UNIQUE,
    client_id UUID NOT NULL,
    worker_id UUID NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id),
    FOREIGN KEY (worker_id) REFERENCES users(id)
);


/* ===========================================================
   ADMIN ACTIONS (Log de acciones del admin)
   =========================================================== */
CREATE TABLE admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL,
    action VARCHAR(200) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

END;
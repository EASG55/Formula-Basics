-- 1. Módulo de Usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Módulo Educativo
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    order_index INT
);

CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    module_id INT REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    content_text TEXT,
    xp_reward INT DEFAULT 10
);

-- 3. Módulo F1 (El Paddock)
CREATE TABLE constructors (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(50) UNIQUE, -- ID de la API (ej: 'red_bull')
    name VARCHAR(100) NOT NULL,
    nationality VARCHAR(50),
    logo_url VARCHAR(255),
    base VARCHAR(100)
);

CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(50) UNIQUE, -- ID de la API (ej: 'max_verstappen')
    current_constructor_id INT REFERENCES constructors(id) ON DELETE SET NULL,
    code VARCHAR(3),
    number INT,
    fullname VARCHAR(100) NOT NULL,
    country VARCHAR(50),
    image_url VARCHAR(255)
);

CREATE TABLE races (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(50) UNIQUE,
    round INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    date DATE,
    circuit_name VARCHAR(100),
    city VARCHAR(100),
    country VARCHAR(50)
);

CREATE TABLE race_results (
    id SERIAL PRIMARY KEY,
    race_id INT REFERENCES races(id) ON DELETE CASCADE,
    driver_id INT REFERENCES drivers(id) ON DELETE CASCADE,
    constructor_id INT REFERENCES constructors(id) ON DELETE CASCADE,
    position INT,
    points FLOAT,
    grid INT
);

-- 4. Módulo de Progreso
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'completed',
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id) -- Un usuario no puede completar la misma lección dos veces
);
/* ==========================================
   🏎️ FORMULA BASICS - DATABASE SCHEMA
   Generado desde pgAdmin4 y optimizado para desarrollo.
   ========================================== */

-- ==========================================
-- 1. AUTENTICACIÓN Y USUARIOS
-- ==========================================

-- Tabla de Pilotos registrados (Usuarios de la app)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- 2. DATOS OFICIALES F1 (INGESTA DE JOLPICA)
-- ==========================================

-- Escuderías y Constructores
CREATE TABLE constructors (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(50) UNIQUE, -- ID que viene de la API de Jolpica (ej: 'mercedes')
    name VARCHAR(100) NOT NULL,
    nationality VARCHAR(50),
    base VARCHAR(100)
);

-- Pilotos Oficiales del Mundial
CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(50) UNIQUE, -- ID de Jolpica (ej: 'antonelli')
    code VARCHAR(3),                -- Abreviatura (ej: 'ANT')
    number INTEGER,                 -- Dorsal (ej: 12)
    fullname VARCHAR(100) NOT NULL,
    country VARCHAR(50),
    constructor_id INTEGER REFERENCES constructors(id) -- Relación con la escudería
);

-- Calendario Oficial de Grandes Premios
CREATE TABLE races (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(50) UNIQUE,
    round INTEGER NOT NULL,         -- Número de carrera en el año (1, 2, 3...)
    name VARCHAR(100) NOT NULL,     -- Ej: 'Bahrain Grand Prix'
    date DATE,
    circuit_name VARCHAR(100),
    city VARCHAR(100),
    country VARCHAR(50)
);

-- Resultados Históricos de las Carreras
CREATE TABLE race_results (
    id SERIAL PRIMARY KEY,
    race_id INTEGER REFERENCES races(id) ON DELETE CASCADE,
    driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
    constructor_id INTEGER REFERENCES constructors(id) ON DELETE CASCADE,
    position INTEGER,               -- Posición final en carrera
    points DOUBLE PRECISION,        -- Puntos obtenidos
    grid INTEGER,                   -- Posición de salida
    time_gap VARCHAR(20),           -- Distancia con el líder (ej: '+2.3s')
    
    -- Un piloto no puede tener dos resultados distintos en la misma carrera
    CONSTRAINT unique_race_driver UNIQUE (race_id, driver_id) 
);


-- ==========================================
-- 3. ACADEMIA Y GAMIFICACIÓN
-- ==========================================

-- Módulos o "Cursos" principales
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    order_index INTEGER             -- Para ordenar visualmente en el frontend
);

-- Lecciones dentro de cada Módulo
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    content_text TEXT,              -- Aquí van las etiquetas mágicas [WIDGET_API]
    xp_reward INTEGER DEFAULT 10    -- Experiencia otorgada al completarla
);

-- Registro de telemetría: ¿Qué lecciones ha completado cada usuario?
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'completed',
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Un usuario no puede completar la misma lección dos veces
    CONSTRAINT unique_user_lesson UNIQUE (user_id, lesson_id)
);
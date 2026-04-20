# 🏎️ Formula Basics

> **La plataforma educativa y estadística definitiva para entender el Gran Circo de la Fórmula 1.**

**Formula Basics** es una aplicación Full-Stack diseñada para acercar la complejidad técnica y deportiva de la Fórmula 1 a nuevos aficionados. Combina una academia interactiva gamificada con un panel de telemetría en tiempo real que consume datos históricos y actuales del mundial.

---

## ✨ Características Principales

* 🎓 **Academia Interactiva:** Módulos de aprendizaje que explican desde el formato de un fin de semana hasta el funcionamiento de la aerodinámica y los motores híbridos.
* 🏆 **Sistema de Gamificación:** Los usuarios ganan puntos de experiencia (XP) al completar lecciones, subiendo de rango desde "Karting" hasta "Campeón del Mundo".
* 📊 **Telemetría Histórica:** Consulta el palmarés, victorias y puntos actuales de todos los pilotos y escuderías de la parrilla.
* 📅 **Live Standings & Calendario:** Clasificación del mundial actualizada y resultados de los podios de cada carrera de la temporada en curso.
* 📱 **Diseño Responsivo (Mobile-Ready):** Interfaz moderna adaptada a cualquier dispositivo, utilizando técnicas de *Glassmorphism* y un sistema de grillas dinámico.

---

## 🏗️ Arquitectura y Tecnologías (Stack PERN)

El proyecto está construido sobre una arquitectura moderna basada en microservicios desplegados en la nube, garantizando un flujo de datos rápido y seguro.

### Frontend (Cliente)
* **React.js & Vite:** Construcción de la Single Page Application (SPA) para una navegación fluida.
* **React Router DOM:** Enrutamiento interno protegido y dinámico.
* **Axios:** Gestión de peticiones HTTP con interceptores para inyección de tokens de seguridad.
* **CSS3 nativo:** Diseño a medida sin librerías externas.
* ☁️ **Hosting:** Desplegado globalmente en **Vercel** (Edge Network).

### Backend (Servidor)
* **Node.js & Express.js:** Motor principal de la API RESTful.
* **JWT & Bcrypt:** Autenticación de sesiones y encriptación unidireccional de contraseñas.
* **Node-Cron & Child Process:** Ejecución de procesos automatizados en segundo plano.
* ☁️ **Hosting:** Servidor web alojado en **Render**.

### Base de Datos y Datos Externos
* **PostgreSQL:** Base de datos relacional para guardar usuarios, progresos (XP) y el catálogo maestro de la F1.
* ☁️ **Hosting DB:** Arquitectura Serverless alojada en **Neon.tech**.
* **Jolpica API (Ergast F1):** Fuente externa de verdad para resultados oficiales y telemetría de la FIA.

---

## ⚙️ ¿Cómo funciona? (Flujo de Datos)

Para evitar la saturación de APIs externas y garantizar tiempos de carga de milisegundos, el proyecto implementa un sistema autónomo de **Ingesta y Caché**:

1. **Auto-Ingesta Programada:** Cada lunes por la madrugada, un *Cron Job* interno arranca los motores del backend para buscar nuevos resultados de carreras en la API de Jolpica y actualizar la base de datos PostgreSQL de forma autónoma.
2. **Caché Efímera:** Para las clasificaciones del mundial y estadísticas pesadas, el servidor genera archivos estáticos JSON locales (`standings_backup.json` y `stats_backup.json`). El frontend consume estos archivos al instante, eludiendo la latencia de la red externa.
3. **Health Check:** Un sistema de monitorización externo (UptimeRobot) hace un *ping* constante a la ruta `/api/health` del servidor, manteniendo el hardware despierto y la caché siempre disponible para el próximo visitante.
4. **Seguridad Frontend:** Los formularios de registro implementan validaciones Regex estrictas (contraseñas seguras, formato email) antes de enviar la carga útil, protegiendo al backend de tráfico basura.

---
*Desarrollado con pasión por el automovilismo y la ingeniería de software.* 🏁
